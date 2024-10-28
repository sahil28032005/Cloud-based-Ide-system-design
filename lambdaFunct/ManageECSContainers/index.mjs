import { ECSClient, ListTasksCommand, RunTaskCommand, StopTaskCommand } from '@aws-sdk/client-ecs';
import Redis from 'ioredis';

// Create Redis client and log connection
const redis = new Redis({
    host: '',
    port: 16822,
    password: '',
});

// Log Redis connection status
redis.on('connect', () => {
    console.log('Connected to Redis');
});

redis.on('error', (err) => {
    console.error('Redis connection error:', err);
});

const ecsClient = new ECSClient();

const CLUSTER_NAME = 'cloud-manager-cluster';
const IDLE_TASK_COUNT = 5;

const trackContainerState = async (containerId, state) => {
    console.log(`Tracking container state: ${containerId} -> ${state}`);
    await redis.hset('containers', containerId, state);
};

const getContainerStates = async () => {
    console.log('Fetching all container states from Redis');
    return await redis.hgetall('containers');
};

const stopIdleContainers = async () => {
    console.log('Checking for idle containers to stop');
    const containerStates = await getContainerStates();

    for (const [id, state] of Object.entries(containerStates)) {
        if (state === 'idle') {
            console.log(`Stopping idle container: ${id}`);
            const stopTaskCommand = new StopTaskCommand({
                cluster: 'cloud-manager-cluster',
                task: id,
                reason: 'Stopping idle container',
            });
            await ecsClient.send(stopTaskCommand);
            await trackContainerState(id, 'stopped');
        }
    }
};

const runNewTasks = async () => {
    console.log('Listing currently running tasks');
    const listTasksCommand = new ListTasksCommand({
        cluster: 'cloud-manager-cluster',
        desiredStatus: 'RUNNING',
    });
    const { taskArns } = await ecsClient.send(listTasksCommand);
    console.log(`Found ${taskArns.length} running tasks`);

    for (const taskArn of taskArns) {
        await trackContainerState(taskArn, 'running');
    }

    const idleTaskCount = IDLE_TASK_COUNT - taskArns.length;
    if (idleTaskCount > 0) {
        console.log(`Starting ${idleTaskCount} new idle tasks to maintain minimum count`);
        for (let i = 0; i < idleTaskCount; i++) {
            const runTaskCommand = new RunTaskCommand({
                cluster: 'cloud-manager-cluster',
                taskDefinition: 'sahil-sadekar-java-server:14',
                count: 1,
                launchType: 'FARGATE',
                networkConfiguration: {
                    awsvpcConfiguration: {
                        subnets: ['subnet-0e0c97b6f83bfc538', 'subnet-08a60214836f38b79'],
                        securityGroups: ['sg-0bf9e7e682e1bed1a'],
                        assignPublicIp: 'ENABLED',
                    },
                },
            });
            const { tasks } = await ecsClient.send(runTaskCommand);
            console.log(`Started new task: ${tasks[0].taskArn}`);
            await trackContainerState(tasks[0].taskArn, 'running');
        }
    } else {
        console.log('No additional tasks needed to reach the idle count');
    }
};

export const handler = async () => {
    console.log('Executing container management handler');
    await stopIdleContainers();
    await runNewTasks();

    console.log('Container management executed successfully');
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Container management executed successfully',
        }),
    };
};

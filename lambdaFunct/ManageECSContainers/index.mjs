import { ECSClient, ListTasksCommand, RunTaskCommand, StopTaskCommand } from '@aws-sdk/client-ecs';
import Redis from 'ioredis';

// Create Redis client and log connection
const redis = new Redis({
    host: 'redis-16822.c264.ap-south-1-1.ec2.redns.redis-cloud.com',
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

// Track container state and allocation status
const trackContainerState = async (containerId, state) => {
    console.log(`Tracking container state: ${containerId} -> ${state}`);
    await redis.hset(`container:${containerId}`, 'state', state, 'allocated', 'unallocated');
};

const stopIdleContainers = async () => {
    console.log('Checking for idle containers to stop');
    const containerStates = await redis.hgetall('containers');

    for (const [id, state] of Object.entries(containerStates)) {
        if (state === 'idle') {
            console.log(`Stopping idle container: ${id}`);
            const stopTaskCommand = new StopTaskCommand({
                cluster: CLUSTER_NAME,
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
        cluster: CLUSTER_NAME,
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
                cluster: CLUSTER_NAME,
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

export const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));
    
    const taskDetails = event.detail; // Capture task details from the event
    const taskId = taskDetails.taskArn.split('/').pop(); // Extract task ID
    const desiredStatus = taskDetails.desiredStatus; // 'RUNNING', 'STOPPED', etc.

    try {
        // Update the Redis state based on the task's desired status
        await trackContainerState(taskId, desiredStatus);
        console.log(`Updated Redis: Container ${taskId} is now ${desiredStatus}`);
    } catch (err) {
        console.error('Error updating Redis:', err);
    }

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

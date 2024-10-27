import { ECSClient, ListTasksCommand, RunTaskCommand, StopTaskCommand } from '@aws-sdk/client-ecs';
import Redis from 'ioredis';

const ecsClient = new ECSClient();
const redis = new Redis(process.env.REDIS_URL); // Use environment variable for Redis connection

const CLUSTER_NAME = process.env.CLUSTER_NAME;
const IDLE_TASK_COUNT = 5;

const trackContainerState = async (containerId, state) => {
    await redis.hset('containers', containerId, state);
};

const getContainerStates = async () => {
    return await redis.hgetall('containers');
};

const stopIdleContainers = async () => {
    const containerStates = await getContainerStates();
    for (const [id, state] of Object.entries(containerStates)) {
        if (state === 'idle') {
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
    const listTasksCommand = new ListTasksCommand({
        cluster: CLUSTER_NAME,
        desiredStatus: 'RUNNING',
    });
    const { taskArns } = await ecsClient.send(listTasksCommand);

    for (const taskArn of taskArns) {
        await trackContainerState(taskArn, 'running');
    }

    const idleTaskCount = IDLE_TASK_COUNT - taskArns.length;
    if (idleTaskCount > 0) {
        for (let i = 0; i < idleTaskCount; i++) {
            const runTaskCommand = new RunTaskCommand({
                cluster: CLUSTER_NAME,
                taskDefinition: process.env.TASK_DEFINITION,
                count: 1,
                launchType: 'FARGATE',
                networkConfiguration: {
                    awsvpcConfiguration: {
                        subnets: process.env.SUBNETS.split(','), 
                        securityGroups: [process.env.SECURITY_GROUP],
                        assignPublicIp: 'ENABLED',
                    },
                },
            });
            const { tasks } = await ecsClient.send(runTaskCommand);
            await trackContainerState(tasks[0].taskArn, 'running');
        }
    }
};

export const handler = async () => {
    await stopIdleContainers();
    await runNewTasks();

    return {
        statusCode: 200,
        body: JSON.stringify({
            message: 'Container management executed successfully',
        }),
    };
};

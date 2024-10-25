const Repl = require('../models//repl');
// const AWS = require('aws-sdk'); ///remeber to unistall this
const { ECSClient, RunTaskCommand, ExecuteCommandCommand } = require("@aws-sdk/client-ecs");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const Docker = require('dockerode');
const s3Client = require('../config/s3config');
const path = require('path');
const USER_DATA_DIR = path.join(__dirname, 'user_data');
const { GetObjectCommand, ListObjectsV2Command, PutObjectCommand } = require("@aws-sdk/client-s3");
const mongoose = require('mongoose');
const fs = require("fs");
const docker = new Docker({
    host: 'localhost',
    port: 2375, // Default port for Docker TCP API
    port: 2375, // Default port for Docker TCP API
    // Uncomment the following line if you're using TLS
    // ca: fs.readFileSync('/path/to/cert.pem'), // Use if TLS is enabled
});
//todays checkpoint started
//build 2 will start from tommorow
//to connect with previously created docker container

//controller for downloading data from s3 at first time repel creation

// Initialize the ECS service object
const ecs = new ECSClient({
    region: 'ap-south-1', // Replace with your AWS region
});

//awss function for grnerate presigned url for cintainer tasks
//generate presigne url for each file
async function getPreSignedUrl(bucketName, keys) {

    //array to storer all data uri
    console.log("key", keys, "bucketName", bucketName);
    const uri = [];
    console.log("arrived bucket name: " + bucketName);
    for (key of keys) {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: key
        });

        //get url for the current key
        try {
            const url = await getSignedUrl(s3Client, command, { expiresIn: 300 });
            console.log("url by inb cmd: " + url);
            uri.push(url);
        }
        catch (err) {
            console.error("error getting data from s3: " + err.message);
        }

    }


    //generate presigned url for 5 minutes of valid access

    return uri;


}

async function downloadFileFromS3(req, res, bucketName, key, downloadPath) {
    try {
        console.log("arrived in downloading state of file named", key);
        const params = {
            Bucket: bucketName,
            Key: key,
        }

        const command = new GetObjectCommand(params);
        const data = await s3Client.send(command);

        return new Promise((resolve, reject) => {
            const filestream = fs.createWriteStream(downloadPath);
            data.Body.pipe(filestream);
            data.Body.on('error', reject);
            filestream.on('finish', resolve);
        });
    }
    catch (e) {
        return { error: e.message };
    }
}


//first getting list of avaliable data from particular s3 bucket adn download it individually
async function listObjectsFromS3(req, res, bucketName, folderKey) {
    console.log("arrived bucket ", bucketName, "folderkit", folderKey);
    try {
        console.log('listObjectsFromS3');
        const params = {
            Bucket: bucketName,
            Prefix: folderKey
        }

        //make lister command using aws sdk metthods as we want data in that file
        const command = new ListObjectsV2Command(params);
        const data = await s3Client.send(command);
        console.log("S3 List Response:", data); // Add this for debuggin
        //now return data we just got
        return data.Contents.map((item) => item.Key);
    }
    catch (e) {
        console.log("in catch block", e.message);
        return { error: e.message };
    }
}

//we have key folder param such as java nodejs or cpp for that we have to make another controlleer which manage it to me send to particular filee download controller control
async function downloadFolderFromS3(req, res, bucketName, folderKey, localPath) {
    try {
        //java/ 
        console.log("arrived inside download folder");

        // Trim the folderKey to remove any extra spaces
        const trimmedFolderKey = folderKey.trim();

        const objectKeys = await listObjectsFromS3(req, res, bucketName, trimmedFolderKey);
        console.log("after listing", objectKeys);


        // Download each object into the local structure temporarily
        for (const objectKey of objectKeys) {
            console.log("objectKey", objectKey); // Log the object key

            // Trim the objectKey to remove any extra spaces
            const trimmedObjectKey = objectKey.trim();
            const relativePath = trimmedObjectKey.replace(trimmedFolderKey, '').trim(); // Adjust as needed
            const localFilePath = path.join(localPath, relativePath);

            console.log("localpath", localFilePath); // Log the local file path

            // Check whether the local folder exists and create it if it doesn't
            const dirPath = path.dirname(localFilePath).trim(); // Trim any spaces
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                console.log(`Directory created successfully: ${dirPath}`);
            } else {
                console.log(`Directory already exists: ${dirPath}`);
            }
            // console.log("dir", dir); // Log the directory path
            // await fs.promises.mkdir(dir, { recursive: true }); // Use the asynchronous version
            // Skip downloading if the key represents a folder (folderKey ends with '/')
            if (objectKey.endsWith('/')) {
                continue;
            }
            console.log("directory created successfully");
            // Download the file from S3
            await downloadFileFromS3(req, res, bucketName, trimmedObjectKey, localFilePath);
        }
        console.log("All files downloaded successfully.");
        return { success: true };
    } catch (err) {
        console.error("Error downloading folder:", err.message); // Log the error
        return { success: false, message: err.message };
    }
}

exports.connectToDockerContainer = async (req, res) => {
    try {
        const { replId, userId } = req.params;

        //find the repel is present for ensurity
        const repl = await Repl.findById(replId);
        if (!repl) {
            return res.status(404).send({ message: 'Repel not found' });

        }
        const userWorkspaceDir = path.join(USER_DATA_DIR, repl.owner.toString());
        //spin the new docker container
        const container = await docker.createContainer({
            Image: `user_isolation_${repl.language}`,
            name: `repl-${repl._id}`,
            Tty: true, // Terminal interaction enabled
            // Env: [
            //     `LANG=${repl.language}`, // Pass the language as an environment variable
            //     ...repl.environment ? Object.entries(repl.environment).map(([key, value]) => `${key}=${value}`) : []
            // ],
            Labels: { replId: repl._id.toString() },
            HostConfig: {
                // Binds: [
                //     // Bind mount the user's workspace directory into the container
                //     `${userWorkspaceDir}:/usr/src/app/workspaces/${repl.owner.toString()}`
                // ],
                PortBindings: {
                    '3000/tcp': [{ HostPort: '3000' }],
                    '5000/tcp': [{ HostPort: '5000' }],
                }
            }
        });
        console.log("spinning isolated environment for user");
        await container.start();

        // Update the Repl record with the new containerId
        const containerId = container.id;
        repl.containerId = containerId;
        await repl.save();

        ///at this time we have our container is started and in running state
        // now we have to copy files inside it from s3
        //idea is to pull it locally first and then copy in contaner and remove from local and same for stopping containner

        //prepare local path to download file on main server
        const localPath = path.join(__dirname, `../user_data/${userId}/${replId}`);
        console.log("started to download files from s3 at time of reconnection");
        await downloadFolderFromS3(req, res, "userrepels", `${userId}/${replId}`, localPath);
        console.log("done downloading files!");
        const downloadPath = localPath;
        const targetPath = `/usr/src/app/workspaces/${repl.owner.toString()}`;
        const command = `docker cp "${downloadPath}/." "${containerId}:${targetPath}"`;
        await new Promise((resolve, reject) => {
            require('child_process').exec(command, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });

        console.log("Files copied to container");
        console.log("removing from local environment");

        // Optionally: Remove downloaded files after copying
        fs.rmdirSync(downloadPath, { recursive: true });
        return res.status(201).send({ success: true });

    }
    catch (err) {
        res.status(500).send(err.message);
    }
}

// exports.connectToDockerContainer = async (req, res) => {
//     try {
//         const { replId } = req.params;
//         console.log("arrived replId: ", replId);
//         //find that repel
//         const repl = await Repl.findById(replId);
//         if (!repl) {
//             return res.status(404).json({ message: 'Repl not found' });
//         }
//         const containerId = repl.containerId;  // Retrieve the containerId
//         if (!containerId) {
//             return res.status(404).json({ message: 'Container not found for this Repl' });
//         }

//         //get the docker container instance
//         const container = docker.getContainer(containerId);

//         //check container state weather running or not
//         const containerInfo = await container.inspect();

//         if (containerInfo.State.Running) {
//             console.log(`Container ${containerId} is already running`);
//         } else {
//             // Start the container if it's not running
//             await container.start();
//             console.log(`Started container ${containerId}`);
//         }

//         // Send the container connection details back to the frontend
//         res.status(200).json({
//             success: true,
//             message: 'Connected to the container',
//             containerId: containerId,
//             // Include any other relevant details you might need
//         });
//     }
//     catch (err) {
//         res.status(500).send(err.message);
//     }
// }
const startDockerContainerEcs = async (repl) => {
    console.log("ecs docker starter");
    try {

        //we have come for repel cretion mesna we need access to s3 generate presigned uri
        const uri = await listObjectsFromS3('base-templates-by-sahil2005', `${repl.language}/`);
        console.log("after listing", uri);
        const accessUris = await getPreSignedUrl('base-templates-by-sahil2005', uri);
        console.log('Pre-signed URL:', accessUris);
        const params = {
            cluster: 'cloud-manager-cluster', // Your ECS cluster name
            taskDefinition: 'sahil-sadekar-java-server:12', // The task definition name
            launchType: 'FARGATE', // Choose 'FARGATE' or 'EC2'
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: ['subnet-0e0c97b6f83bfc538', 'subnet-08a60214836f38b79', 'subnet-0c4be927b2f4c3790'], // Your VPC subnet ID
                    securityGroups: ['sg-0bf9e7e682e1bed1a'], // Your security group ID
                    assignPublicIp: 'ENABLED', // Or 'DISABLED' depending on your requirements
                },
            },
            overrides: {
                containerOverrides: [
                    {
                        name: 'java-container', // Replace with your container name from the task definition
                        command: [
                            'sh', '-c', // Runs a shell command inside the container
                            `aws s3 cp s3://base-templates-by-sahil2005/${repl.language} /usr/src/app/workspaces/${repl.owner.toString()} --recursive`
                            // Copies files from S3 to the /app folder inside the container and starts your app
                        ],
                    },
                ],
            },
            count: 1, // Number of tasks to run
        };

        //above lines will responsible for service configuration and task defination selected to run
        // const data = await ecs.send(new RunTaskCommand(params));
        //retrive arn of that task
        // console.log("Task started successfully:", data);

        // Extract task ARN from the response
        // if (data.tasks && data.tasks.length > 0) {
        //     const taskArn = data.tasks[0].taskArn;
        //     console.log("Task ARN:", taskArn);
        //     return taskArn;
        // } else {
        //     console.log("No tasks started");
        // }

        //till this we have started docker container using task defination in s3

        //further copy our base templates from s3 to container as per his language

    }
    catch (err) {
        console.log(err.message);
    }
}

//function for spinning docker containers
const startDockerContainer = async (req, res, repl) => {
    console.log("arrived inside start docker container method");
    try {
        // Construct path to the user's workspace directory
        const userWorkspaceDir = path.join(USER_DATA_DIR, repl.owner.toString());
        console.log("while spin", repl.owner.toString());
        //local side configs
        // Here we have repl access of newly created repl by user
        // const container = await docker.createContainer({
        //     Image: `user_isolation_${repl.language}`,
        //     name: `repl-${repl._id}`,
        //     Tty: true, // Terminal interaction enabled
        //     // Env: [
        //     //     `LANG=${repl.language}`, // Pass the language as an environment variable
        //     //     ...repl.environment ? Object.entries(repl.environment).map(([key, value]) => `${key}=${value}`) : []
        //     // ],
        //     Labels: { replId: repl._id.toString() },
        //     HostConfig: {
        //         // Binds: [
        //         //     // Bind mount the user's workspace directory into the container
        //         //     `${userWorkspaceDir}:/usr/src/app/workspaces/${repl.owner.toString()}`
        //         // ],
        //         PortBindings: {
        //             '3000/tcp': [{ HostPort: '3000' }],
        //             '5000/tcp': [{ HostPort: '5000' }],
        //         }
        //     }
        // });

        // console.log("spinning isolated environment for user");
        // await container.start();

        //define base foldder key name in our case java/nodejs/...

        //server side config after amazon aws integrations
        const params = {
            cluster: 'cloud-manager-cluster', // Your ECS cluster name
            taskDefinition: 'sahil-sadekar-java-server:13', // The task definition name
            launchType: 'FARGATE', // Choose 'FARGATE' or 'EC2'
            networkConfiguration: {
                awsvpcConfiguration: {
                    subnets: ['subnet-0e0c97b6f83bfc538', 'subnet-08a60214836f38b79', 'subnet-0c4be927b2f4c3790'], // Your VPC subnet ID
                    securityGroups: ['sg-0bf9e7e682e1bed1a'], // Your security group ID
                    assignPublicIp: 'ENABLED', // Or 'DISABLED' depending on your requirements
                },
            },
            overrides: {
                containerOverrides: [
                    {
                        name: 'java-container', // Replace with your container name from the task definition
                        environment: [
                            {
                                name: 'REPL_OWNER',
                                value: String(repl.owner)  // Pass userId from the environment variable
                            },
                            {
                                name: 'REPL_UNIQUE_ID',
                                value: String(repl._id)  // Pass `REPL_ID` from environment
                            }
                        ]
                    },
                ],
            },
            count: 1, // Number of tasks to run
        };

        //start the container
        const data = await ecs.send(new RunTaskCommand(params));
        //above line wil start container

        //stoer task arn for future user such as data copying and retrival and many more ....
        const taskArn = data.tasks[0].taskArn;
        console.log("comtainer started....");


        // const baseFolderKey = `${repl.language}/`;
        // const downloadPath = userWorkspaceDir;
        // console.log("user workspace area", downloadPath);
        // //start downloading process
        // await downloadFolderFromS3(req, res, 'base-templates-by-sahil2005', baseFolderKey, downloadPath);
        // console.log("downloaded files from server side s3");

        // //now copy downnloaded data to the  container for use
        // const targetPath = `/usr/src/app/workspaces/${repl.owner.toString()}`;
        // const containerName = 'java-container';
        // const copyCommand = `sh -c "cp -r ${downloadPath}* ${targetPath}"`; 

        // //params fo copying
        // const execParams = {
        //     cluster: 'cloud-manager-cluster',
        //     task: taskArn.split('/')[1], // Extract task ID from the ARN
        //     container: containerName,
        //     command: copyCommand,
        // };
        // const execResult = await ecs.send(new ExecuteCommandCommand(execParams));
        // if (execResult && execResult.payload) {
        //     console.log('Files copied to the container:', execResult);
        // } else {
        //     console.error('Failed to copy files to the container. No execution result returned.');
        // }
        //copy that files in actual containers working directory so user can acceess his codebase
        // const containerId = container.id;
        // const targetPath = `/usr/src/app/workspaces/${repl.owner.toString()}`;
        // const command = `docker cp "${downloadPath}/." "${containerId}:${targetPath}"`;
        // await new Promise((resolve, reject) => {
        //     require('child_process').exec(command, (err) => {
        //         if (err) {
        //             reject(err);
        //         } else {
        //             resolve();
        //         }
        //     });
        // });

        // console.log("Files copied to container");
        // console.log("removing from local environment");

        // // Optionally: Remove downloaded files after copying
        // fs.rmdirSync(downloadPath, { recursive: true });
        // return container;
    } catch (err) {
        console.error("Error starting Docker container:", err);
        throw new Error(err.message);
    }
}
//select contaner for stopping as per appropriate repel
exports.decideStoppingContainer = async (req, res) => {
    try {
        const { replId } = req.body;
        console.log("arrived replid", replId);
        //find container id through repl id by performing validators for repls
        const repl = await Repl.findById(replId);
        if (!repl) {
            return res.status(404).json({ message: 'Repl not found' });
        }
        const containerId = repl.containerId;  // Retrieve the containerId
        if (!containerId) {
            return res.status(404).json({ message: 'Container not found for this Repl' });
        }

        //get the docker container instance
        const container = docker.getContainer(containerId);

        //check container state weather running or not
        const containerInfo = await container.inspect();

        //here we have that container acccess
        if (containerInfo.State.Running) {
            //before stopping copy data to the locacl file of main server for soome uploading purpose for some time
            const userId = repl.owner.toString();
            const localPath = path.join(__dirname, `../user_data/${userId}/${replId}`);

            //ensurity for local folder as it is exists or not
            fs.mkdirSync(localPath, { recursive: true });
            // Define the container's working directory path
            const containerWorkdir = `/usr/src/app/workspaces/${userId}`;


            // Command to copy the files from the container to the local path
            const copyCommand = `docker cp "${containerId}:${containerWorkdir}/." "${localPath}"`;
            await new Promise((resolve, reject) => {
                require('child_process').exec(copyCommand, (err) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve();
                    }
                });
            });

            console.log("Files copied from container to server");

            //after copying upoda that files to s3
            // Upload the files to S3
            console.log("at time to be sent", localPath);
            await uploadFolderToS3(req, res, userId, replId, localPath);

            //now here we find that container is running and we have to stop them
            await stopDockerContainer(container.id);
            console.log('container stopped successfully');

            // Remove the container permanently
            await container.remove();
            console.log('Container removed successfully');

            //remove server files as they will crate load on server if unnecessary traffic will come
            fs.rmSync(localPath, { recursive: true, force: true });  // Use fs.rmdirSync(localPath, { recursive: true }) if using an older Node.js version
            console.log(`Local path ${localPath} and its contents have been deleted`);

            return res.status(200).send({ success: true, message: 'Container stopped and local files removed successfully' });
        }
        // return res.satus(301).send('api problem for stopping contaainer');
    }
    catch (err) {
        return res.status(500).send(err.message);
    }
}


//for stopping docker container
const stopDockerContainer = async (containerId) => {
    try {
        const container = docker.getContainer(containerId);
        await container.stop();
        // await container.remove();
    } catch (error) {
        console.error('Error stopping container:', error);
        throw new Error('Failed to stop Docker container');
    }
};

//create a new repl
exports.createRepl = async (req, res) => {
    const { name, language, containerId } = req.body;
    try {
        const newRepl = new Repl({
            owner: req.user.id,
            name, language, containerId
        });
        await newRepl.save();
        // here template creation is done using validation of berer token
        const container = await startDockerContainer(req, res, newRepl);
        // const container = await startDockerContainerEcs(newRepl);
        // Update the Repl with the container ID and save it
        // newRepl.containerId = container.id;
        await newRepl.save();
        console.log("repel was saved");
        // Respond with the created Repl data
        return res.status(200).json({ success: true, repl: newRepl });
        // return res.status(200).json({ success: true });
    }
    catch (err) {
        return res.status(401).send({ message: err.message });
    }
}

//getting repel by id
exports.getReplById = async (req, res) => {
    try {
        const repl = await Repl.findById(req.params.id);
        res.status(200).json(repl);
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }
}

//updating repel
exports.updateRepl = async (req, res) => {
    try {
        const { name, lenguage, status } = req.body;
        const updatedRepl = await Repl.findByIdAndUpdate(req.params.id, { name, language, status }, { new: true });
        res.status(201).json(updatedRepl);
    }
    catch (err) {
        res.status(500).send({ message: err.message });
    }
}

// Delete a Repl
exports.deleteRepl = async (req, res) => {
    try {
        await Repl.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: 'Repl deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//controller for fetch all repels related to single user
exports.getRepels = async (req, res) => {
    const { userId } = req.params;
    try {
        const repos = await Repl.find({ owner: new mongoose.Types.ObjectId(userId) });
        res.json({ repos: repos });
    }
    catch (err) {
        res.status(500).json({ message: err.message });
    }
}

async function uploadFolderToS3(req, res, userId, replId, localPath) {
    try {
        // console.log("arrived locallpath", localPath);
        //reading all the files recursivvely
        const uploadFiles = async (dir) => {
            const files = fs.readdirSync(dir);
            console.log("arrived locallpath", dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                const stat = fs.statSync(filePath);

                if (stat.isDirectory()) {
                    // Recursively upload subdirectories
                    await uploadFiles(filePath);
                }
                else {
                    // Prepare the S3 key based on userId and replId
                    const s3Key = `${userId}/${replId}/${path.relative(localPath, filePath)}`;

                    //read the file contents
                    const fileContent = fs.readFileSync(filePath);

                    //upload to s3
                    await s3Client.send(new PutObjectCommand({
                        Bucket: 'userrepels',
                        Key: s3Key,
                        Body: fileContent,
                        ContentType: 'text/plain'
                    }));
                    console.log(`Uploaded ${s3Key} to S3`);

                }
            }
        }
        //start the upload process
        await uploadFiles(localPath);
    }
    catch (e) {
        console.error(e); // Log the error for debugging
        throw new Error('Failed to upload folder to S3'); // Rethrow the error
    }
}
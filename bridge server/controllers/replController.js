const Repl = require('../models//repl');
const Docker = require('dockerode');
const client = require('../config/s3config');
const path = require('path');
const USER_DATA_DIR = path.join(__dirname, 'user_data');
const { GetObjectCommand, ListObjectsV2Command } = require("@aws-sdk/client-s3");
const mongoose = require('mongoose');
const fs = require("fs");
const docker = new Docker({
    host: 'localhost',
    port: 2375, // Default port for Docker TCP API
    port: 2375, // Default port for Docker TCP API
    // Uncomment the following line if you're using TLS
    // ca: fs.readFileSync('/path/to/cert.pem'), // Use if TLS is enabled
});
//build 2 will start from tommorow
//to connect with previously created docker container

//controller for downloading data from s3 at first time repel creation
async function downloadFileFromS3(req, res, bucketName, key, downloadPath) {
    try {
        const params = {
            Bucket: bucketName,
            Key: key,//here key comes as Main.java/main.cpp
        }

        const command = new GetObjectCommand(params);
        const data = await client.send(command);

        return new Promise((resolve, reject) => {
            const filestream = fs.createWriteStream(downloadPath);
            data.Body.pipe(filestream);
            data.Body.on('error', reject);
            filestream.on('finish', resolve);
        });
    }
    catch (e) {
        return res.status(404).send(e.message);
    }
}


//first getting list of avaliable data from particular s3 bucket adn download it individually
async function listObjectsFromS3(req, res, bucketName, folderKey) {
    try {
        const params = {
            Bucket: bucketName,
            Prefix: folderKey
        }

        //make lister command using aws sdk metthods as we want data in that file
        const command = new ListObjectsV2Command(params);
        const data = await client.send(command);

        //now return data we just got
        return data.Content.map((item) => item.Key);
    }
    catch (e) {
        return res.status(404).send(e.message);
    }
}

//we have key folder param such as java nodejs or cpp for that we have to make another controlleer which manage it to me send to particular filee download controller control
async function downloadFolderFromS3(req, res, bucketName, folderKey, localPath) {
    try {
        //now we have key of foler as node/cpp/java
        //list all object in that folder key as it is our code files in my case
        const objectKeys = await listObjectsFromS3(bucketName, folderKey);
        //download each objects in local strucuure temprorily
        for (const objectKey of objectKeys) {
            //now we have objectKey like java/Main.java
            const relativePath = objectKey.replace(folderKey, ' ');
            //relativePath is Main.java
            const localFilePath = path.join(localPath, relativePath);

            //check weather local folder exists
            const dir = path.dirname(localFilePath);
            fs.mkdirSync(dir, { recursive: true });

            // Download the file from S3
            await downloadFileFromS3(bucketName, key, localFilePath);
        }
    }
    catch (err) {
        res.status(404).send(err.message);
    }

}
exports.connectToDockerContainer = async (req, res) => {
    try {
        const { replId } = req.params;
        console.log("arrived replId: ", replId);
        //find that repel
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

        if (containerInfo.State.Running) {
            console.log(`Container ${containerId} is already running`);
        } else {
            // Start the container if it's not running
            await container.start();
            console.log(`Started container ${containerId}`);
        }

        // Send the container connection details back to the frontend
        res.status(200).json({
            success: true,
            message: 'Connected to the container',
            containerId: containerId,
            // Include any other relevant details you might need
        });
    }
    catch (err) {
        res.status(500).send(err.message);
    }
}

//function for spinning docker containers
const startDockerContainer = async (req, res, repl) => {
    console.log("arrived inside start docker container method");
    try {
        // Construct path to the user's workspace directory
        const userWorkspaceDir = path.join(USER_DATA_DIR, repl.owner.toString());

        // Here we have repl access of newly created repl by user
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



        return container;
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
            //now here we find that container is running and we have to stop them
            await stopDockerContainer(container.id);
            console.log('container stopped successfully');
            return res.status(200).send({ success: true, message: 'Container stopped successfully' });
        }
        return res.satus(301).send('api problem for stopping contaainer');
    }
    catch (err) {
        res.status(500).send(err.message);
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
        //here template creation is done using validation of berer token
        const container = await startDockerContainer(req, res, newRepl);
        // Update the Repl with the container ID and save it
        newRepl.containerId = container.id;
        await newRepl.save();
        console.log("repel was saved");
        // Respond with the created Repl data
        return res.status(200).json({ success: true, repl: newRepl });
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
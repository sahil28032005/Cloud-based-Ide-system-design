const Repl = require('../models//repl');
const Docker = require('dockerode');
const path = require('path');
const USER_DATA_DIR = path.join(__dirname, 'user_data');
const mongoose = require('mongoose');
const docker = new Docker({
    host: 'localhost',
    port: 2375, // Default port for Docker TCP API
    // Uncomment the following line if you're using TLS
    // ca: fs.readFileSync('/path/to/cert.pem'), // Use if TLS is enabled
});

//to connect with previously created docker container
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
            Image: 'user_isolation',
            name: `repl-${repl._id}`,
            Tty: true, // Terminal interaction enabled
            Env: [
                `LANG=${repl.language}`, // Pass the language as an environment variable
                ...repl.environment ? Object.entries(repl.environment).map(([key, value]) => `${key}=${value}`) : []
            ],
            Labels: { replId: repl._id.toString() },
            HostConfig: {
                // Binds: [
                //     // Bind mount the user's workspace directory into the container
                //     `${userWorkspaceDir}:/usr/src/app/workspaces/${repl.owner.toString()}`
                // ],
                PortBindings: {
                    '5000/tcp': [{ HostPort: '5000' }] // This maps container port 5000 to host port 5000
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
const decideStoppingContainer = async (req, res) => {
    try {
        const { replId } = req.body;

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
            return res.status(200).send({ message: 'Container stopped successfully' });
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
        return res.status(200).json(newRepl);
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
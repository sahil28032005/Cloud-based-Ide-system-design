const Repl = require('../models//repl');
const Docker = require('dockerode');
const docker = new Docker({
    host: 'localhost',
    port: 2375, // Default port for Docker TCP API
    // Uncomment the following line if you're using TLS
    // ca: fs.readFileSync('/path/to/cert.pem'), // Use if TLS is enabled
});


//function for spinning docker containers
const startDockerContainer = async (req, res, repl) => {
    console.log("arrived inside start ocker container method");
    try {
        //here we have repl access of newly craeted repl by user
        const container = await docker.createContainer({
            Image: 'user_isolation',
            name: `repl-${repl._id}`,
            Tty: true, //terminal intereaction enabled
            Env: repl.environment ? Object.entries(repl.environment).map(([key, value]) => `${key}=${value}`) : [],
            Labels: { replId: repl._id.toString() },
            HostConfig: {
                // Binds: [
                //     `/user_data/${repl.owner}/:${repl.name}/data`  // Bind mount user data directories
                // ]
                PortBindings: {
                    '5000/tcp': [{ HostPort: '5000' }]  // This maps container port 5000 to host port 5001
                }
            }
        });
        console.log("spinning isolated environment for user");
        await container.start();
        return container;
    }
    catch (err) {
        console.error("Error starting Docker container:", err);
        throw new Error(err.message);
    }
}

//for stopping docker container
const stopDockerContainer = async (containerId) => {
    try {
        const container = docker.getContainer(containerId);
        await container.stop();
        await container.remove();
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
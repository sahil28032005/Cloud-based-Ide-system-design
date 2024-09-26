const Repl = require('../models//repl');
const Docker=require('dockerode');
const docker = new Docker({ socketPath: '/var/run/docker.sock' });

//function for spinning docker containers
const startDockerContainer = async (req, res) => {
    try {
       
    }
    catch (err) {
        res.status(500).send(err.message);
    }
}

//create a new repl
exports.createRepl = async (req, res) => {
    const { name, language, containerId } = req.body;
    try {
        const newRepl = new Repl({
            owner: req.user.id,
            name, language, containerId
        });
        await newRepl.save();
        res.status(200).json(newRepl);
    }
    catch (err) {
        res.status(401).send({ message: err.message });
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
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card'; // Shadcn Card component
import { Button } from '@/components/ui/button'; // Shadcn Button component
import { Skeleton } from '@/components/ui/skeleton'; // Shadcn Skeleton component
import { Input } from '@/components/ui/input'; // Shadcn Input component
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'; // Shadcn Dialog component for modal
import Navbar from './Navbar'; // Assuming you have a Navbar component
import './Repos.css'; // Optional: custom styling

const Repos = () => {
    const { userId } = useParams();
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreateRepoOpen, setIsCreateRepoOpen] = useState(false);
    const [newRepoName, setNewRepoName] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRepos = async () => {
            try {
                const response = await axios.get(`http://localhost:5002/api/repls/${userId}/repos`);
                setRepos(response.data);
            } catch (err) {
                setError('Error fetching repositories');
            } finally {
                setLoading(false);
            }
        };

        fetchRepos();
    }, [userId]);

    const handleRepoClick = async (replId) => {
        try {
            const response = await axios.post(`http://localhost:5002/api/repls/connect-container/${replId}`);
            if (response.data.success) {
                navigate(`/?userId=${userId}`);
            } else {
                console.error('Failed to connect to the container:', response.data.message);
            }
        } catch (err) {
            console.error('Error connecting to container:', err);
        }
    };

    const handleCreateRepo = async () => {
        if (!newRepoName) return;
        try {
            const response = await axios.post(`http://localhost:5002/api/repls/${userId}/create-repo`, { name: newRepoName });
            if (response.data.success) {
                setRepos([...repos, response.data.repo]);
                setIsCreateRepoOpen(false); // Close modal
                setNewRepoName(''); // Reset input
            }
        } catch (err) {
            console.error('Error creating repository:', err);
        }
    };

    return (
        <div className="repos-container bg-gray-900 text-white min-h-screen">
            {/* Navbar */}
            <Navbar />

            <div className="container mx-auto p-8">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-3xl font-bold">{userId}'s Recent Repositories</h2>
                    <Button onClick={() => setIsCreateRepoOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Create Repository
                    </Button>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, idx) => (
                            <Skeleton key={idx} className="w-full h-48 rounded-lg" />
                        ))}
                    </div>
                ) : error ? (
                    <p className="text-red-500 text-center">{error}</p>
                ) : repos.repos?.length === 0 ? (
                    <p className="text-center text-gray-400">No repositories found.</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        {repos.repos.map((repo) => (
                            <Card
                                key={repo._id}
                                className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 cursor-pointer"
                                onClick={() => handleRepoClick(repo._id)}
                            >
                                <h3 className="text-xl font-semibold mb-2 text-gray-100">{repo.name}</h3>
                                <p className="text-gray-400">{repo.status || 'No status provided'}</p>
                                <p className="text-gray-500 text-sm mt-4">
                                    Created: {new Date(repo.createdAt).toLocaleDateString() || 'Unknown date'}
                                </p>
                                <p className="text-gray-500 text-sm">Visibility: {repo.visibility || 'No information'}</p>
                                <Button className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                                    Open Repository
                                </Button>
                            </Card>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Repository Modal */}
            <Dialog open={isCreateRepoOpen} onOpenChange={setIsCreateRepoOpen}>
                <DialogContent className="bg-gray-900 text-white p-6 rounded-lg shadow-lg">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-semibold">Create a New Repository</DialogTitle>
                    </DialogHeader>
                    <Input
                        placeholder="Repository Name"
                        value={newRepoName}
                        onChange={(e) => setNewRepoName(e.target.value)}
                        className="mb-4 p-4 text-lg bg-gray-800 border border-gray-700 rounded-lg text-white"
                    />
                    <Button onClick={handleCreateRepo} className="bg-blue-600 hover:bg-blue-700 w-full text-lg py-2 rounded-lg">
                        Create
                    </Button>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Repos;

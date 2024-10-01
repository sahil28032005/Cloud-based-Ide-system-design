import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectContent, SelectItem } from '@/components/ui/select';
import { TooltipProvider, Tooltip } from '@/components/ui/tooltip'; // Import TooltipProvider
import Navbar from './Navbar';
import './Repos.css';

// Typing Animation Component
const TypingAnimation = ({ text, speed }) => {
    const [displayedText, setDisplayedText] = useState('');
    let index = 0;

    useEffect(() => {
        const interval = setInterval(() => {
            if (index < text.length) {
                setDisplayedText((prev) => prev + text[index]);
                index += 1;
            } else {
                clearInterval(interval);
            }
        }, speed);
        return () => clearInterval(interval);
    }, [text, speed]);

    return <h2 className="text-5xl font-bold text-purple-400">{displayedText}</h2>;
};

const Repos = () => {
    const { userId } = useParams();
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isCreateRepoOpen, setIsCreateRepoOpen] = useState(false);
    const [newRepoName, setNewRepoName] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('');
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
                navigate(`/?userId=${userId}&replId=${replId}`);
            } else {
                console.error('Failed to connect to the container:', response.data.message);
            }
        } catch (err) {
            console.error('Error connecting to container:', err);
        }
    };

    const handleCreateRepo = async () => {
        if (!newRepoName || !selectedLanguage) return;
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post(`http://localhost:5002/api/repls/create-repel`, {
                name: newRepoName,
                language: selectedLanguage,
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setRepos([...repos, response.data.repo]);
                setIsCreateRepoOpen(false);
                setNewRepoName('');
                setSelectedLanguage('');
            } else {
                alert("Something went wrong!");
            }
        } catch (err) {
            console.error('Error creating repository:', err);
        }
    };

    return (
        <TooltipProvider> {/* Wrap your content with TooltipProvider */}
            <div className="repos-container bg-gray-950 text-white min-h-screen transition-colors duration-300">
                <Navbar />

                <div className="container mx-auto p-8">
                    <div className="flex justify-between items-center mb-8">
                        <TypingAnimation text={`${userId}'s Recent Repositories`} speed={100} />
                        <Button onClick={() => setIsCreateRepoOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white shadow-md transition duration-300 transform hover:scale-105">
                            Create Repository
                        </Button>
                    </div>

                    <div className="mb-8 text-center">
                        <p className="text-lg text-gray-300">
                            Our cloud IDE allows you to create, edit, and run your code in a collaborative environment.
                        </p>
                        <p className="text-lg text-gray-300">
                            Choose your favorite programming language and start building amazing projects today!
                        </p>
                    </div>

                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[...Array(8)].map((_, idx) => (
                                <Skeleton key={idx} className="w-full h-48 rounded-lg" />
                            ))}
                        </div>
                    ) : error ? (
                        <p className="text-red-400 text-center">{error}</p>
                    ) : repos.repos?.length === 0 ? (
                        <p className="text-center text-gray-400">No repositories found.</p>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                            {repos.repos.map((repo) => (
                                <Tooltip key={repo._id} content="Click to open repository" placement="top">
                                    <Card
                                        className="bg-gray-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 transform hover:-translate-y-1 cursor-pointer"
                                        onClick={() => handleRepoClick(repo._id)}
                                    >
                                        <h3 className="text-xl font-semibold mb-2 text-purple-300 transition duration-300 transform hover:scale-105">{repo.name}</h3>
                                        <p className="text-gray-400">{repo.status || 'No status provided'}</p>
                                        <p className="text-gray-500 text-sm mt-4">
                                            Created: {new Date(repo.createdAt).toLocaleDateString() || 'Unknown date'}
                                        </p>
                                        <p className="text-gray-500 text-sm">Visibility: {repo.visibility || 'No information'}</p>
                                        <Button className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-md transition duration-300 transform hover:scale-105">
                                            Open Repository
                                        </Button>
                                    </Card>
                                </Tooltip>
                            ))}
                        </div>
                    )}
                </div>

                {/* Create Repository Modal */}
                <Dialog open={isCreateRepoOpen} onOpenChange={setIsCreateRepoOpen}>
                    <DialogContent className="bg-gray-800 text-white p-6 rounded-lg shadow-lg">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-semibold text-purple-300">Create a New Repository</DialogTitle>
                        </DialogHeader>
                        <Input
                            placeholder="Repository Name"
                            value={newRepoName}
                            onChange={(e) => setNewRepoName(e.target.value)}
                            className="mb-4 p-4 text-lg bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring focus:ring-purple-500"
                        />
                        <Select onValueChange={(value) => setSelectedLanguage(value)}>
                            <SelectTrigger className="mb-4 p-4 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring focus:ring-purple-500">
                                {selectedLanguage || 'Select Repository Type'}
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="java">Java</SelectItem>
                                <SelectItem value="cpp">C++</SelectItem>
                                <SelectItem value="python">Python</SelectItem>
                                <SelectItem value="rust">Rust</SelectItem>
                                <SelectItem value="html_css_js">HTML, CSS, JS</SelectItem>
                                <SelectItem value="nodejs">Node.js</SelectItem>
                            </SelectContent>
                        </Select>
                        <Button onClick={handleCreateRepo} className="bg-purple-600 hover:bg-purple-700 w-full text-lg py-2 rounded-lg shadow-md transition duration-300 transform hover:scale-105">
                            Create
                        </Button>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
};

export default Repos;

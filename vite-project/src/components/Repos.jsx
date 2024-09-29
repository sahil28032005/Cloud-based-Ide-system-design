import React, { useEffect, useState } from 'react'
import { useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import './Repos.css'; // Optional for styling
import { useNavigate } from 'react-router-dom';

const Repos = () => {
    const { userId } = useParams();
    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
    if (loading) {
        return <p>Loading repositories...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    //repo click handler
    const handleRepoClick = async (replId) => {
        try {
            const response = await axios.post(`http://localhost:5002/api/repls/connect-container/${replId}`);
            console.log("rds", response.data.success);
            if (response.data.success) { // Check if the connection was successful
                console.log("navigating");
                navigate(`/?userId=${userId}`); // Navigate to the desired route
            } else {
                console.error('Failed to connect to the container:', response.data.message);
            }
        }
        catch (err) {
            console.error('Error connecting to container:', error);
        }
    }

    return (
        <div className="repos-container">
            {console.log("repos", repos)}
            <h2>{userId}'s Rescent Repositories</h2>
            {repos[0]?.length === 0 ? (
                <p>No repositories found.</p>
            ) : (
                <ul className="repo-list">
                    {repos?.repos.map((repo) => (
                        <li onClick={() => handleRepoClick(repo._id)} key={repo._id} className="repo-item">
                            <h3>{repo.name}</h3>
                            <p>{repo.status || 'No description provided'}</p>
                            <p>{repo.createdAt || 'No description provided'}</p>
                            <p>{repo.visibility || 'No description provided'}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    )
}

export default Repos
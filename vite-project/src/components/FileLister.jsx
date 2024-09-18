import React, { useEffect, useState, useRef, useContext } from 'react';
import { UserContext } from '../../context/UserContextComponent';
import { FaFolder, FaFolderOpen, FaFile } from 'react-icons/fa'; // Import icons

const FileLister = ({ onSelect, socket }) => {
    const { userId } = useContext(UserContext);
    const [fileTree, setFileTree] = useState({});
    const [expandedFolders, setExpandedFolders] = useState({});
    const pathStore = useRef('');

    useEffect(() => {
        if (socket && userId) {
            fetch(`http://localhost:5000/files?userId=${userId}`)
                .then(response => response.json())
                .then(data => setFileTree(data))
                .catch(err => console.error(err));

            socket.on('file-structure-update', (updatedTree) => {
                setFileTree(updatedTree);
            });
        }
    }, [socket, userId]);

    const handleFileClick = (filePath) => {
        onSelect(filePath);
    };

    const toggleFolder = (folderPath) => {
        setExpandedFolders(prevState => ({
            ...prevState,
            [folderPath]: !prevState[folderPath]
        }));
    };

    const renderFileTree = (tree, depth = 0, path = '') => {
        return (
            <ul style={{ paddingLeft: depth * 15, listStyle: 'none', margin: 0 }}>
                {Object.keys(tree).map(key => {
                    const currentPath = path + key;
                    const isFolder = typeof tree[key] === 'object' && Object.keys(tree[key]).length > 0; // Check if it's a folder
                    const isExpanded = expandedFolders[currentPath];

                    return (
                        <li key={key} style={{ margin: '5px 0' }}>
                            <div
                                onClick={() => {
                                    isFolder ? toggleFolder(currentPath) : handleFileClick(currentPath);
                                }}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    cursor: 'pointer',
                                    padding: '5px 10px',
                                    borderRadius: '4px',
                                    backgroundColor: isFolder ? (isExpanded ? '#f0f0f0' : '#fafafa') : '#ffffff',
                                    transition: 'background-color 0.2s',
                                    color: isFolder ? '#007acc' : '#333',
                                    fontWeight: isFolder ? 'bold' : 'normal'
                                }}
                                onMouseOver={e => (e.currentTarget.style.backgroundColor = '#e6f7ff')}
                                onMouseOut={e => (e.currentTarget.style.backgroundColor = isFolder && isExpanded ? '#f0f0f0' : '#fafafa')}
                            >
                                {isFolder ? (
                                    isExpanded ? <FaFolderOpen style={{ marginRight: 5 }} /> : <FaFolder style={{ marginRight: 5 }} />
                                ) : (
                                    <FaFile style={{ marginRight: 5 }} />
                                )}
                                {key}
                            </div>
                            {isFolder && isExpanded && renderFileTree(tree[key], depth + 1, currentPath + '/')}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <div style={{
            padding: '10px',
            background: '#2d2d2d', 
            color: '#eaeaea', 
            height: '100%', 
            overflowY: 'auto', 
            borderRight: '1px solid #444',
            fontFamily: 'monospace'
        }}>
            {renderFileTree(fileTree)}
        </div>
    );
};

export default FileLister;

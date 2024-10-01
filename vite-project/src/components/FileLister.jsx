import React, { useEffect, useState, useRef, useContext } from 'react';
import { UserContext } from '../../context/UserContextComponent';
import { FaFolder, FaFolderOpen, FaFile } from 'react-icons/fa';
import { Tooltip } from "@/components/ui/tooltip";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

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
                    const isFolder = typeof tree[key] === 'object' && Object.keys(tree[key]).length > 0;
                    const isExpanded = expandedFolders[currentPath];

                    return (
                        <li key={key} style={{ margin: '5px 0' }}>
                            <Tooltip content={isFolder ? "Open Folder" : "Open File"}>
                                <div
                                    onClick={() => {
                                        isFolder ? toggleFolder(currentPath) : handleFileClick(currentPath);
                                    }}
                                    className={`flex items-center cursor-pointer p-2 rounded-md transition-colors duration-200 ${
                                        isFolder ? (isExpanded ? "bg-gray-700" : "bg-gray-800") : "bg-gray-600"
                                    }`}
                                    onMouseOver={e => (e.currentTarget.style.backgroundColor = '#444')}
                                    onMouseOut={e => (e.currentTarget.style.backgroundColor = isFolder && isExpanded ? '#333' : '#222')}
                                >
                                    {isFolder ? (
                                        isExpanded ? <FaFolderOpen className="mr-2 text-orange-400" /> : <FaFolder className="mr-2 text-orange-300" />
                                    ) : (
                                        <FaFile className="mr-2 text-lime-400" />
                                    )}
                                    <span className="text-white">{key}</span>
                                </div>
                            </Tooltip>
                            {isFolder && isExpanded && renderFileTree(tree[key], depth + 1, currentPath + '/')}
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <Card className="bg-gray-900 text-white h-full overflow-hidden">
            <ScrollArea className="h-full">
                <div style={{ padding: '10px', fontFamily: 'monospace' }}>
                    {renderFileTree(fileTree)}
                </div>
            </ScrollArea>
        </Card>
    );
};

export default FileLister;

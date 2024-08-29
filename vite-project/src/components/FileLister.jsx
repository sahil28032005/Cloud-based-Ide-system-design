import React, { useEffect, useState, useRef } from 'react'

const FileLister = ({ onSelect, socket }) => {
    //selection manager
    const handleFileClick = (filePath) => {
        onSelect(filePath);
    };


    const [fileTree, setFileTree] = useState({});
    const pathStore = useRef('');
    //get file data as component renders first time
    useEffect(() => {
        fetch('http://localhost:5000/files')
            .then(response => response.json())
            .then(data => setFileTree(data))
            .catch(err => console.error(err));

        socket.on('file-structure-update', (updatedTree) => {
            setFileTree(updatedTree);
        });
    }, [socket]);

    const renderFileTree = (tree, depth = 0, path = '') => {
        return (
            <>
                {/* {console.log("current path: ", path)} */}
                <div >
                    <ul style={{ paddingLeft: depth * 20, listStyle: 'none' }}>
                        {Object.keys(tree).map(key => {
                            const currentPath = path + key;
                            console.log("calculating childs for ", key);
                            console.log("childcount", Object.keys(tree[key]).length);

                            return (
                                <li key={key}>
                                    <div onClick={() => { handleFileClick(currentPath); console.log(currentPath) }}>{key}</div>
                                    {typeof tree[key] === 'object' && tree[key] !== null && renderFileTree(tree[key], depth + 1, currentPath + '/')}

                                </li>
                            )
                        })}
                    </ul>
                </div>
            </>


        );
    };


    return (
        <div style={{ border: '2px solid black', position: 'fixed', height: '100%', width: '20vw', left: '0' }}>
            <h1>File Structure</h1>
            {renderFileTree(fileTree)}
        </div>
    )
}

export default FileLister
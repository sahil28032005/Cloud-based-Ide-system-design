import React, { useEffect, useState, useRef } from 'react'

const FileLister = ({ socket }) => {
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
                {console.log("current path: ", path)}
                <div >
                    <ul style={{ paddingLeft: depth * 20, listStyle: 'none' }}>
                        {Object.keys(tree).map(key => {
                            path += key

                            return (
                                <li key={key}>
                                    <div>{key}</div>
                                    {typeof tree[key] === 'object' && tree[key] !== null && renderFileTree(tree[key], depth + 1, path+'/')}
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
import React, { useEffect, useState } from 'react'

const FileLister = () => {
    const [fileTree, setFileTree] = useState({});

    //get file data as component renders first time
    useEffect(() => {
        fetch('http://localhost:5000/files')
            .then(response => response.json())
            .then(data => setFileTree(data))
            .catch(err => console.error(err));
    }, []);

    const renderFileTree = (tree, depth = 0) => {
        return (
            <div >
                <ul style={{ paddingLeft: depth * 20, listStyle: 'none' }}>
                    {Object.keys(tree).map(key => (
                        <li key={key}>
                            {key}
                            {typeof tree[key] === 'object' && tree[key] !== null && renderFileTree(tree[key], depth + 1)}
                        </li>
                    ))}
                </ul>
            </div>

        );
    };


    return (
        <div style={{border:'2px solid black',position:'fixed',height:'100%',width:'20vw',left:'0'}}>
            <h1>File Structure</h1>
            {renderFileTree(fileTree)}
        </div>
    )
}

export default FileLister
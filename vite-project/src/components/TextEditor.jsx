import React, { useState, useEffect, useContext } from 'react';
import "quill/dist/quill.snow.css";
import ReactQuill from 'react-quill';
import axios from 'axios';
import { UserContext } from '../../context/UserContextComponent';
import './TextEditor.css';  // Importing custom CSS

//customized text editor properties
const modules = {
    toolbar: [
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }, { align: [] }],
        [{ "color": [] }],
    ]
};

//customized formats for text editor
const formats = [
    "header", "height", "bold", "italic",
    "underline", "strike", "blockquote",
    "list", "color", "bullet", "indent",
    "link", "image", "align", "size",
];

const TextEditor = ({ filePath }) => {
    const [content, setContent] = useState('');
    const { userId } = useContext(UserContext);

    // File selection data retrieval
    useEffect(() => {
        if (filePath) {
            axios.get('http://localhost:5000/read-file', { params: { filePath, userId } })
                .then(response => setContent(response.data.content))
                .catch(err => console.log("File reading error:", err.message));
        }
    }, [filePath, userId]);

    // Function to save content
    const handleSave = () => {
        axios.post('http://localhost:5000/write-file', { filePath, content, userId })
            .then(() => console.log("File saved successfully"))
            .catch(error => console.log("Error saving file:", error.message));
    };

    return (
        <div className="editor-container">
            <div className="editor-header">
                <h2>{filePath ? filePath.split('/').pop() : 'Untitled Document'}</h2>
                <button className="save-btn" onClick={handleSave}>Save</button>
            </div>
            <ReactQuill
                theme="snow"
                modules={modules}
                formats={formats}
                value={content}
                onChange={setContent}
                placeholder="Write your content..."
                className="custom-editor"
            />
        </div>
    );
};

export default TextEditor;

import React, { useState, useEffect, useContext, useRef } from 'react';
import "quill/dist/quill.snow.css";
import ReactQuill from 'react-quill';
import axios from 'axios';
import { UserContext } from '../../context/UserContextComponent';
import './TextEditor.css';  // Importing custom CSS
import Editor, { useMonaco } from '@monaco-editor/react';

//customized text editor properties
// const modules = {
//     toolbar: [
//         [{ size: ["small", false, "large", "huge"] }],
//         ["bold", "italic", "underline", "strike", "blockquote"],
//         [{ list: "ordered" }, { list: "bullet" }],
//         ["link", "image"],
//         [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }, { align: [] }],
//         [{ "color": [] }],
//     ]
// };

// //customized formats for text editor
// const formats = [
//     "header", "height", "bold", "italic",
//     "underline", "strike", "blockquote",
//     "list", "color", "bullet", "indent",
//     "link", "image", "align", "size",
// ];

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

    //monaco custom function
    // function handleEditorChange(value, event) {
    //     // here is the current value
    //     console.log("value:", value);
    // }
    // //contains all information about editor such as typing events ,arrow keys events and keeps track of it
    // function handleEditorDidMount(editor, monaco) {
    //     console.log('onMount: the editor instance:', editor);
    //     console.log('onMount: the monaco instance:', monaco);
    // }
    // function handleEditorWillMount(monaco) {
    //     console.log('beforeMount: the monaco instance:', monaco);
    // }

    // function handleEditorValidation(markers) {
    //     // model markers
    //     // markers.forEach(marker => console.log('onValidate:', marker.message));
    // }
    // const monaco = useMonaco();
    // useEffect(() => {
    //     if (monaco) {
    //         console.log('here is the monaco instance:', monaco);
    //     }
    // }, [monaco]);
    const editorRef = useRef(null);

    function handleEditorDidMount(editor, monaco) {
        editorRef.current = editor;
    }

    return (
        // <div className="editor-container">
        //     <div className="editor-header">
        //         <h2>{filePath ? filePath.split('/').pop() : 'Untitled Document'}</h2>
        //         <button className="save-btn" onClick={handleSave}>Save</button>
        //     </div>
        //     <ReactQuill
        //         theme="snow"
        //         modules={modules}
        //         formats={formats}
        //         value={content}
        //         onChange={setContent}
        //         placeholder="Write your content..."
        //         className="custom-editor"
        //     />
        // </div>
        <Editor
            height="100vh" // Fullscreen editor
            defaultLanguage="javascript"
            defaultValue="// Start coding here..."
            theme="vs-dark" // Use dark theme
            options={{
                fontFamily: 'Fira Code, monospace',
                fontSize: 16,
                fontLigatures: true,
                smoothScrolling: true,
                cursorSmoothCaretAnimation: true,
                cursorBlinking: 'smooth',
                minimap: {
                    enabled: true,
                    showSlider: 'always',
                },
                scrollbar: {
                    verticalScrollbarSize: 8,
                    horizontalScrollbarSize: 8,
                },
                padding: {
                    top: 20,
                    bottom: 20,
                },
                bracketPairColorization: true,
                autoClosingBrackets: 'always',
                autoClosingQuotes: 'always',
                tabSize: 2,
                wordWrap: 'on',
                overviewRulerBorder: false,
            }}
            onMount={handleEditorDidMount}
        />
    );
};

export default TextEditor;

import React, { useState, useEffect } from 'react'
import "quill/dist/quill.snow.css";
import ReactQuill from 'react-quill';
import axios from 'axios'

//customized text editor properties
var modules = {
    toolbar: [
        [{ size: ["small", false, "large", "huge"] }],
        ["bold", "italic", "underline", "strike", "blockquote"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
            { align: [] }
        ],
        [{ "color": ["#000000", "#e60000", "#ff9900", "#ffff00", "#008a00", "#0066cc", "#9933ff", "#ffffff", "#facccc", "#ffebcc", "#ffffcc", "#cce8cc", "#cce0f5", "#ebd6ff", "#bbbbbb", "#f06666", "#ffc266", "#ffff66", "#66b966", "#66a3e0", "#c285ff", "#888888", "#a10000", "#b26b00", "#b2b200", "#006100", "#0047b2", "#6b24b2", "#444444", "#5c0000", "#663d00", "#666600", "#003700", "#002966", "#3d1466", 'custom-color'] }],
    ]
};

//cutomized formats for text editor
var formats = [
    "header", "height", "bold", "italic",
    "underline", "strike", "blockquote",
    "list", "color", "bullet", "indent",
    "link", "image", "align", "size",
];

//content change notifier event functuon
const handleProcedureContentChange = (content) => {
    console.log("content---->", content);
};
//supposing we have filepath for selected file and we have to write there fro props
//that was taken as props for refer inside while component as locall param
const TextEditor = ({ filePath }) => {
    const [content, setContent] = useState('');


    // file selection data retrival
    useEffect(() => {
        if (filePath) {
            axios.get('http://localhost:5000/read-file', { params: { filePath: filePath,userId: 'e76a7bb1-9b33-45b8-bdcf-4256c59fcf9b'   } })
                .then(response => {
                    setContent(response.data.content);
                })
                .catch(err => {
                    console.log("reading basedd issues", err.message);
                });
        }
    }, [filePath]);
    //function to save content written inside editor
    const handleSave = () => {
        try {
            //makeing writer request
            axios.post('http://localhost:5000/write-file', { filePath, content,userId: 'e76a7bb1-9b33-45b8-bdcf-4256c59fcf9b' }).then((response => {
                console.log("file saved successfully...");
            })).catch((error) => {
                console.log("error saving file: " + error.message);
            });
        }
        catch (err) {
            console.log(err.message);
        }
    }
    return (
        <>
            <div style={{height:'60%'}}>
                <div style={{ display: 'flex', height: '100%' }}>
                    <ReactQuill
                        theme="snow"
                        modules={modules}
                        formats={formats}
                        placeholder="write your content ...."
                        value={content}
                        onChange={setContent}
                        style={{ flex: 1,background:'#c8ceb8'}}
                    />
                    {/* <div><button onClick={handleSave}>save</button></div> */}
                    {/* <button onClick={() => { handleSave() }}>save program</button> */}
                </div>
                {console.log(content)}
            </div>
        </>

    )
}

export default TextEditor
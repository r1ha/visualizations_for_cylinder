import React, { useState } from 'react'

function Notes(){
    const [notes, setNotes] = useState([]);

    const [newNote, setNewNote] = useState("");

    const addNote = () => {
        if (newNote.trim() === "") return;
        setNotes([...notes, newNote]);
        setNewNote("");
    }

    return(
        <>
            <div>
                <h1 className="text-[50px]">Notes</h1>
                <input 
                    type="text" 
                    value={newNote} 
                    onChange={(e) => setNewNote(e.target.value)} 
                    placeholder="Add a new note" 
                />

                <button onClick={addNote}>Add Note</button>

                <ul>
                    {notes.map((note, index) => (
                        <li key={index}>{note}</li>
                    ))}
                </ul>
            </div>
        </>
    )
}

export default Notes
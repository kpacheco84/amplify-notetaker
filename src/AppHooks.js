import React, {useState, useEffect} from 'react';
import { withAuthenticator, includeGreetings,AmplifyGreetings } from '@aws-amplify/ui-react';
import { Greetings} from 'aws-amplify-react';
import {API, graphqlOperation} from 'aws-amplify';
import {createNote, updateNote} from './graphql/mutations';

import {deleteNote} from './graphql/mutations';
import {listNotes} from './graphql/queries';
import {onCreateNote,onDeleteNote, onUpdateNote} from './graphql/subscriptions';

//try to get Greetings to show up with username or name
// I NEED TO FIX MY ENTIRE HOOKS FILE HERE


const App = () => {
    const [id, setID] = useState("")
    const [note, setNote] = useState("")
    const [notes, setNotes] = useState([])

useEffect(() =>{
    getNotes();
    const createNoteListener =API.graphql(graphqlOperation(onCreateNote)).subscribe({
      next: noteData => {
          console.log(noteData)
          const newNote = noteData.value.data.onCreateNote

          setNotes(prevNotes =>{
              const oldNotes = prevNotes.filter(note => note.id !== newNote.id)
          const updatedNotes = [...oldNotes, newNote];
          return updatedNotes
        })
        setNote("");
      }
    });
    const deleteNoteListener = API.graphql(graphqlOperation(onDeleteNote)).subscribe(
      {
        next: noteData => {
            const deletedNote = noteData.value.data.onDeleteNote
            const updatedNotes = this.state.notes.filter(note => note.id !== deletedNote.id
              );
            this.setState({notes: updatedNotes})
        }
      });
     const updateNoteListener = API.graphql(graphqlOperation(onUpdateNote)).subscribe(

      {
        next: noteData => {
          
            const updatedNote = noteData.value.data.onUpdateNote;
            //this will find the original list item index so to place updated note in same place
            const index = setNotes.findIndex(note => note.id === updatedNote.id)

  // this places note in same place
  const updatedNotes = [
    ...prevNotes.slice(0,index),
    updatedNote,
    ...prevNotes.slice(index + 1)
  ]
  setNotes({notes: updatedNotes, note: "", id: ""});
        }
        
      });

      return () => {
        createNoteListener.unsubscribe();
        deleteNoteListener.unsubscribe();
        updateNoteListener.unsubscribe();

      }
},[])



 const getNotes = async  () => {
  const result = await API.graphql(graphqlOperation(listNotes))
  setNotes( result.data.listNotes.items)

}




const handleChangeNote = event =>setNote(event.target.value);


const hasExistingNote = () => {
    
        if(id){
            const isNote = notes.findIndex(note => note.id === id) > -1
            return isNote;
              }
    return false
      };

    const handleAddNote = async event => { 
    
             event.preventDefault()

    // first call function that will search if id (index) already exists or if its a new note. if false then will add the new note
    if(hasExistingNote()){
            //if note existed already then update it
            handleUpdateNote()
       }else{
    
        const input = {note}

   await API.graphql(graphqlOperation(createNote, {input }));
    //const newNote =result.data.createNote

    //const updatedNotes =[newNote, ...notes]
    
       }
  };



  const handleUpdateNote = async () =>{

  
    const input = {id, note};
    await API.graphql(graphqlOperation(updateNote,{input}))
  
    
}


const handleDeleteNote = async noteid => {
    // const {notes} = this.state;
      const input = { id: noteid}
    await API.graphql(graphqlOperation(deleteNote,{input}))
    
  };


  const handleSetNote = ({note,id }) =>{
        setNote(note)
        setID(id)

  }


    return <div>
      <AmplifyGreetings Greetings = {(username) => 'Welcome ' + username}
          outGreeting = "Please sign in ..."/>
      <div className ="flex flex-column items-center justify-center pa3 bg-washed-red">
        <h2 class Name = "code f2-l">Amplify Note Taking App</h2>
        {/*Note Form*/}
        <form onSubmit = {handleAddNote}className = "mb3">
          <input type = "text" className = "pa2 f4"placeholder = "Write your note"
          onChange ={handleChangeNote}
            value = {note}
            />
         

          <button className= "pa2 f4"type = "submit">
            
            { id ? "Update Note" : "Add Note"}

          </button>
          
           </form>
          {/*Note list*/}
        </div>
        {notes.map(item =>(
            <div key={item.id} className = "flex items-center">
              <li onClick = {() => {handleSetNote(item)}} className = "list pa1 f3">
                 {item.note}
                </li>
                <button onClick = {() =>{handleDeleteNote(item.id)}} className = "bg-transparent bn f4">
                  
                  <span >&times;</span>

                </button>
                </div>
        ))}
        </div>
        
  }


       
     
  
       
 
export default withAuthenticator(App);

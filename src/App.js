import React, {Component} from 'react';
import { withAuthenticator, includeGreetings,AmplifyGreetings } from '@aws-amplify/ui-react';
import { Greetings} from 'aws-amplify-react';
import {API, graphqlOperation} from 'aws-amplify';
import {createNote, updateNote} from './graphql/mutations';

import {deleteNote} from './graphql/mutations';
import {listNotes} from './graphql/queries';

//try to get Greetings to show up with username or name


class App extends Component {

  state= {
    id:"",
    note: "",
    notes:[]
   
  }

 async componentDidMount(){
    const result = await API.graphql(graphqlOperation(listNotes))
    this.setState({notes: result.data.listNotes.items})

 }

  handleChangeNote = event =>this.setState({note: event.target.value});


 hasExistingNote = () => {
      const {notes, id} = this.state
        if(id){
            const isNote = notes.findIndex(note => note.id === id) > -1
            return isNote;
              }
    return false
      };

  handleAddNote = async event => { 
    
    event.preventDefault()

    const {note, notes} = this.state;

    // first call function that will search if id (index) already exists or if its a new note. if false then will add the new note
    if(this.hasExistingNote()){
            //if note existed already then update it
            this.handleUpdateNote()
       }else{
    const input = {note}

    const result = await API.graphql(graphqlOperation(createNote, {input }))
    const newNote =result.data.createNote

    const updatedNotes =[newNote, ...notes]
    this.setState({notes: updatedNotes, note:""});
       }
  };



handleUpdateNote = async () =>{

    const {notes, id, note} = this.state;
    const input = {id, note}
    const result = await API.graphql(graphqlOperation(updateNote,{input}))
    const updatedNote = result.data.updateNote;
    //this will find the original list item index so to place updated note in same place
    const index = notes.findIndex(note => note.id === updatedNote.id)

    // this places note in same place
    const updatedNotes = [
      ...notes.slice(0,index),
      updatedNote,
      ...notes.slice(index + 1)
    ]
    this.setState({notes: updatedNotes, note: "", id: ""})
}


  handleDeleteNote = async noteid => {
      const {notes} = this.state;
      const input = { id: noteid}
      const result = await API.graphql(graphqlOperation(deleteNote,{input}))
      const deletedNoteID = result.data.deleteNote.id;
      const updatedNotes = notes.filter(note => note.id !== deletedNoteID);
      this.setState({notes: updatedNotes});
  };


handleSetNote = ({note,id}) => this.setState({note,id })



  render() {

    const {id,note,notes} = this.state;

    return <div>
      <AmplifyGreetings Greetings = {(username) => 'Welcome ' + username}
          outGreeting = "Please sign in ..."/>
      <div className ="flex flex-column items-center justify-center pa3 bg-washed-red">
        <h2 class Name = "code f2-l">Amplify Note Taking App</h2>
        {/*Note Form*/}
        <form onSubmit = {this.handleAddNote}className = "mb3">
          <input type = "text" className = "pa2 f4"placeholder = "Write your note"
          onChange ={this.handleChangeNote}
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
              <li onClick = {() => {this.handleSetNote(item)}} className = "list pa1 f3">
                 {item.note}
                </li>
                <button onClick = {() =>{this.handleDeleteNote(item.id)}} className = "bg-transparent bn f4">
                  
                  <span >&times;</span>

                </button>
                </div>
        ))}
        </div>
        
  }}


       
     
  
       
 
export default withAuthenticator(App);

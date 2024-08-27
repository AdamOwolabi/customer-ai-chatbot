'use client'
import Image from 'next/image';
import {useState} from 'react';
import { Box, Stack, TextField, Button} from '@mui/material'



export default function Home() {
  const [messages, setMessages] = useState([{
    role: 'assistant',
    content: `Hi I'm the Headstarter Support Agent, how can I assist you today?`,
},
])

  const [message, setMessage] = useState('')

  const sendMessage = async() => {
    const userMessage = message;
    setMessage(''); // Clear the input field
    setMessages((message) => [
      ...message,
      {role: 'user', content: userMessage},
      {role: "assistant", content: ""}
    ])
    console.log(message);
    const response = fetch('api/chat', 
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify([...messages, {role: 'user', content: userMessage}])
      }).then(async (res) => {
        const reader = res.body.getReader()
        const decoder = new TextDecoder()

        let result = ''
        return reader.read().then(function processText({done, value}){
          if(done){
            return result
          }
          const text = decoder.decode(value || new Uint8Array(), {stream:true})
          setMessages((messages)=>{
            let lastMessage = messages[messages.length -1]
            let otherMessages = messages.slice(0, messages.length - 1)
            return[
              ...otherMessages,
              {
                ...lastMessage, content: lastMessage.content + text},
            ]
          })
          return reader.read().then(processText)
        })
      })
  }
  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      alignItems="center"
      flexDirection="column"
      justifyContent="center"
    >
      <Stack
        direction="column"
        width="600px"
        height="700px"
        border="1px solid black"
        p={2}
        spacing={3}
      >
        <Stack
          direction="column"
          spacing={2}

          flexGrow={1}
          overflow="auto"
          maxHeight="100%"
          >
            {messages.map((message, index) => (
                <Box 
                 key= {index} 
                 display='flex' 
                 justifyContent={message.role === 'assistant' ? 'flex-start' : 'flex-end'}
                 >
                 <Box bgcolor={
                   message.role === 'assistant' 
                   ? '#1982d2' 
                   : '#6e2991'
                 }
                 color="white"
                 borderRadius={16}
                 p={3}>
                  {message.content}
                 </Box>
                 </Box>
              ))}
          </Stack>
          <Stack direction="row" spacing={2}>
              <TextField
              label="message"
              fullWidth
              value={message}
              onChange={(e) => setMessage(e.target.value)}/>
              <Button variant="contained" onClick={sendMessage}>Send</Button>
          </Stack>
      </Stack>
    </Box>
  )
}

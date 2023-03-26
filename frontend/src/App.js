import './App.css';
import { useEffect, useState, useRef } from 'react'
import React from 'react'
import arrow from './assets/arrow.png'
import bg from './assets/bg.png'
import mic from './assets/mic.png'
import mic_on from './assets/mic_on.png'
import axios from 'axios';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition'
import { Dna } from 'react-loader-spinner'

function App() {
  const [userInput, setUserInput] = useState('')
  const [recording, setRecording] = useState(false)
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState([
    {
      msg: "Hello, How can I help you ?",
      fromUser: false,
    }
  ])
  const bottomRef = useRef(null);

  const themes = {
    primaryColor: "#475569",
    secondryColor: "#475569",
    primaryFontColor: "white",
    secondryFontColor: "#2C3333",
    logoColor: "#E7F6F2",
    backgroudImage: bg
  }

  const commands = [
    {
      command: 'clear',
      callback: ({ resetTranscript }) => resetTranscript()
    },
    {
      command: 'reset',
      callback: ({ resetTranscript }) => resetTranscript()
    }
  ]

  const {
    transcript,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition({ commands });

  useEffect(() => {
    if (userInput !== '') {
      setLoading(true)
      axios.get(`http://localhost:8000/api/response?message=${userInput}`)
        .then((response) => {

          speechSynthesis.cancel();
          let utterance = new SpeechSynthesisUtterance(response.data);
          speechSynthesis.speak(utterance);

          setUserInput('')
          resetTranscript()
          setMessages([...messages, { msg: response.data, fromUser: false }])
          setLoading(false)
        }, (error) => {
          console.log(error);
        });
    }
  // eslint-disable-next-line
  }, [messages])

  useEffect(() => {
    setUserInput(transcript)
  }, [transcript]);

  const sendMessage = () => {
    if (userInput !== '') {
      setMessages([...messages, { msg: userInput, fromUser: true }]);
    }
  };

  if (!browserSupportsSpeechRecognition) {
    alert("Browser doesn't support speech recognition.")
  }

  const handleRecording = () => {
    if (recording) {
      SpeechRecognition.stopListening()
    }
    else {
      resetTranscript()
      setUserInput('')
      SpeechRecognition.startListening({ continuous: true })
    }
    setRecording(!recording)
  }

  return (
    <div className="min-h-screen bg-gray-100" style={{ background: `url(${themes.backgroudImage})`, backgroundSize: 'cover' }}>

      <div style={{ backgroundColor: themes.primaryColor }} className={`w-full h-18  fixed flex justify-between`}>
        <div style={{ color: themes.logoColor }} className='text-green-100 text-3xl font-bold p-5 font-sans'>VBot</div>
      </div>

      <div className='py-32'>
        <div className="max-w-2xl mx-auto space-y-12 grid grid-cols-1 overflow-y-auto scroll-smooth scrollbar-hide overflow-x-hidden" style={{ maxHeight: '30rem' }}>
          {loading && 
            <div className='flex justify-center items-center'>
              <Dna visible={true} height="100" width="100" ariaLabel="dna-loading" wrapperStyle={{}} wrapperClass="dna-wrapper" />
            </div>
          }
          <ul>
            {messages && messages.map((message, idx) => {
              return (
                <div key={idx} className={`mt-3 ${message.fromUser ? "place-self-end text-right" : "place-self-start text-left"}`}>
                  <div className="mt-3  p-3 rounded-2xl" 
                    style={{ backgroundColor: message.fromUser ? themes.primaryColor : 'white', 
                             color: message.fromUser ? themes.primaryFontColor : themes.secondryFontColor, 
                             borderTopLeftRadius: !message.fromUser && 0, borderTopRightRadius: message.fromUser && 0 }} >
                    <p className="break-words text-md">
                      {message.fromUser ? message.msg : message.msg}
                    </p>
                  </div>
                </div>
              )
            })}
          </ul>
          <div ref={bottomRef} />
        </div>
      </div>

      <div className={`w-full fixed bottom-0`}>
        <div className='justify-end items-center bg-white rounded-xl flex mx-96 my-3'>
          <input className='p-3 bg-white w-full rounded-l-md border-0 outline-none'
            placeholder="Ask your question..."
            type="text"
            id="message"
            name="message"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
          />
          <button className='bg-white px-4' disabled={!browserSupportsSpeechRecognition} onClick={handleRecording}>
            {recording ? <img className='w-10' src={mic_on} alt="mic"></img> : <img className='w-10' src={mic} alt="mic"></img>}
          </button>
          <button style={{ backgroundColor: themes.secondryColor }} className={`p-4 rounded-r-xl`} onClick={sendMessage}>
            <img className='w-8' src={arrow} alt="arrow" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default App;

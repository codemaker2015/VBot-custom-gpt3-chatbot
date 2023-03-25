# pip install openai gradio

import openai
openai.api_key = "" # your token goes here

def get_model_reply(query, context=[]):
    # combines the new question with a previous context
    context += [query]
    
    # given the most recent context (4096 characters)
    # continue the text up to 2048 tokens ~ 8192 charaters
    completion = openai.Completion.create(
        engine='text-davinci-002',
        prompt='\n\n'.join(context)[:4096],
        max_tokens = 2048,
        temperature = 0.4, # Lower values make the response more deterministic
    )
    
    # append response to context
    response = completion.choices[0].text.strip('\n')
    context += [response]
    
    # list of (user, bot) responses. We will use this format later
    responses = [(u,b) for u,b in zip(context[::2], context[1::2])]
    
    return responses, context

query = 'Which is the largest country by area in the world?'
responses, context = get_model_reply(query, context=[])

print('<USER> ' + responses[-1][0])
print('<BOT> ' + responses[-1][1])


import gradio as gr

# defines a basic dialog interface using Gradio
with gr.Blocks() as dialog_app:
    chatbot = gr.Chatbot()
    state = gr.State([])
    
    with gr.Row():
        txt = gr.Textbox(
            show_label=False, 
            placeholder="Enter text and press enter"
        ).style(container=False)

    txt.submit(get_model_reply, [txt, state], [chatbot, state])

# launches the app in a new local port
dialog_app.launch()
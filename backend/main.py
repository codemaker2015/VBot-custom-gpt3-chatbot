import openai
import os
from dotenv import load_dotenv
import os 

load_dotenv(".env")
openai.api_key = os.getenv("OPENAI_API_KEY")

def read_file(file):
    content = ""
    f = open(file, 'r')
    Lines = f.readlines()
    for line in Lines:
        content = content + " " + line.strip()
    return content

session_prompt = read_file("datas/data.txt")
restart_sequence = "\n\nUser:"
start_sequence = "\nVBot:"

def answer(ques, chat_log = None):
    max_try = 1
    try_count = 0
    while True:
        try:
            prompt_text = f'{chat_log}{restart_sequence} {ques}{start_sequence}'
            print(prompt_text)
            response = openai.Completion.create(
                model = "text-davinci-002",
                prompt = prompt_text,
                temperature = 0.8,
                max_tokens = 500,
                top_p = 1,
                frequency_penalty = 0.0,
                presence_penalty = 0.6,
                stop = ["User:", "VBot:"]
            ) 
            # print(response)
            ans = response['choices'][0]['text']
            return str(ans)
        except:
            try_count = try_count + 1
            if(try_count >= max_try): 
                return 'GTP3 error'
            print('Error')

def checkViolation(ans):
    response = openai.Moderation.create(input=ans)
    output = response["results"][0]["flagged"]
    return output

def gpt3_logs(question, answer, chat_log=None):
    if chat_log is None:
        chat_log = session_prompt
    return f'{chat_log}{restart_sequence} {question}{start_sequence}{answer}'

def message_check(message, chat_log):
    flag_user = checkViolation(message)
    if(not flag_user):
        ans = answer(message,chat_log)
        flag_bot = checkViolation(ans)
        if(flag_bot):
            ans = "My response violates OpenAI's Content Policy."
    else:
        ans = "Your message violates OpenAI's Content Policy."
    return ans

def main(msg,chat):
    ans = message_check(msg,chat)
    print("VBot: ", str(ans))
    return ans

if __name__ == "__main__":
    ans = main("What is your name",chat=None)


from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import io
import json
import os
import re
import matplotlib.pyplot as plt
import seaborn as sns
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import JsonOutputParser
# Initialize FastAPI app
app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods
    allow_headers=["*"],  # Allow all headers
)

# Define a folder to store visualizations
VISUALIZATION_FOLDER = "visualizations"
os.makedirs(VISUALIZATION_FOLDER, exist_ok=True)

# Your existing ChatGroq initialization
llm = ChatGroq(
    model="llama-3.1-70b-versatile",
    temperature=0,
    groq_api_key="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"
)

@app.post("/upload/")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    data = pd.read_csv(io.BytesIO(contents))

    # Capture the output of df.info()
    buffer = io.StringIO()
    data.info(buf=buffer)
    info_str = buffer.getvalue()

    # Function to parse only column-specific information
    def parse_columns_info(info_str):
        column_info_pattern = re.compile(r"\s*(\d+)\s+(\w+)\s+(\d+)\s+non-null\s+(\w+)")
        columns_info = []
        
        for match in column_info_pattern.finditer(info_str):
            column = {
                "column": match.group(2),
                "non_null_count": int(match.group(3)),
                "dtype": match.group(4)
            }
            columns_info.append(column)
        
        return columns_info

    # Parse columns info to JSON format
    columns_info = parse_columns_info(info_str)

    # Generate visualization suggestions
    json_data = generate_visualization_suggestions(data)

    # Generate visualizations based on suggestions
    image_paths = visualize_data(data, json_data)
    text=textual_analysis(data)
    # Combine all information into one response
    response_data = {
        "image_paths": image_paths,
        "textual_analysis": text  # You can add any textual analysis response here
    }

    return JSONResponse(content=response_data)

def textual_analysis(data):
    data_sample = data.sample(min(5, len(data)))

    prompt_extract = PromptTemplate.from_template(
        f"""
        ###DATA SAMPLE:
        {data_sample}\n
        ###INSTRUCTION
        The data is from a csv file.
        Your job is to Identify the most relevant columns for stock optimization analysis and inventory management. Additionally, define an optimization heuristic function that would be most effective based on the identified columns. Then return the detailed analysis in the form of text of the data with the help of the heuristic calculations of each. Don't mention the heuristic calculation in the response. The response should be in the form of each member: analysis in the form of textual data. Only return valid JSON. 
        ### VALID JSON (NO PREAMBLE):
        """
    )

    chain_extract = prompt_extract | llm
    response = chain_extract.invoke(input={'data': data_sample.head()})
    
    # Extract JSON from response content
    json_data = None

    # Use JsonOutputParser to ensure valid JSON output
    json_parser = JsonOutputParser()
    try:
        json_data = json_parser.parse(response.content)
    except Exception as e:
        print(f"Failed to parse JSON: {e}")

    return json_data
def generate_visualization_suggestions(data):
    data_sample = data.sample(min(5, len(data)))

    prompt_extract_1 = PromptTemplate.from_template("""
    Analyze the following text and create the column pairs and plot type in JSON Format following this structure:
    {{
      "column1 name:column2 name":"plot_type",
      "column2 name:column3 name":"plot_type",
    }}
    ###DATA SAMPLE:
      {data_sample}\n
      ###INSTRUCTION
      The data is from a csv file.
      Your job is to Extract the most informative columns. Then you calculate all the pairs of those columns that have some relationship with each other. Then return them in JSON Format containing the following keys: column1 name :column2 name: type of plot you would suggest for its visualization. You can use any type of plot
      Only return valid JSON. 
      ### VALID JSON (NO PREAMBLE):
    """)

    chain_extract_1 = prompt_extract_1 | llm 
    response_1 = chain_extract_1.invoke(input={'data_sample': data_sample.head()})

    # Extract JSON from response content
    json_data = None

    # Use regular expression to find JSON-like data in the response content
    json_pattern = r'\{.*?\}'  # Matches JSON-like structures
    matches = re.findall(json_pattern, response_1.content, re.DOTALL)
    if matches:
        json_data = matches[0]  # Get the first match

    return json_data

def visualize_data(data, json_data):
    image_paths = []
    json_data=generate_visualization_suggestions(data)
    json_data = json.loads(json_data)  # Ensure json_data is in dict format
    for columns, viz_type in json_data.items():
        col1, col2 = columns.split(':')  # Split the key into two column names
        img_path = os.path.join(VISUALIZATION_FOLDER, f"{col1}_{col2}_{viz_type}.png")
        
        if viz_type == "scatter":
            plt.figure()
            plt.scatter(data[col1], data[col2], alpha=0.5)
            plt.title(f'Scatter Plot of {col1} vs {col2}')
            plt.xlabel(col1)
            plt.ylabel(col2)
            plt.savefig(img_path)
            plt.close()
            image_paths.append(f"/visualizations/{os.path.basename(img_path)}")

        elif viz_type == "box":
            plt.figure()
            sns.boxplot(x=data[col1], y=data[col2])
            plt.title(f'Box Plot of {col1} vs {col2}')
            plt.xlabel(col1)
            plt.ylabel(col2)
            plt.savefig(img_path)
            plt.close()
            image_paths.append(f"/visualizations/{os.path.basename(img_path)}")

    return image_paths

@app.get("/")
async def root():
    return {"message": "Welcome to the FastAPI file upload service!"}
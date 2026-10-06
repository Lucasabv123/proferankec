# Python image
FROM python:3.12 as base


# Copy the requirements file
COPY requirements.txt requirements.txt
RUN pip install --upgrade pip 
RUN pip install -r requirements.txt


# copy the source code
COPY . . 

# Expose the port 
EXPOSE 8080

# Define the command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]




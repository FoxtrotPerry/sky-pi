# Use python image closest to what is on raspbian
FROM python:3.11.9-bookworm

# Set the working directory in the container
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . .

# Upgrade pip
RUN pip install --upgrade pip

# Install dependencies from pyproject.toml
RUN python -m pip install .

# Run PyInstaller to create the standalone executable
RUN pyinstaller --onefile src/sky_pi_draw/draw.py

# Create a directory for the output
RUN mkdir -p /output

# Copy the generated executable to /output directory
RUN cp dist/draw /output/draw

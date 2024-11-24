# MedicAI: Patient-Doctor AI Matching Intelligent System and Database

### Introduction
MedicAI is an innovative patient-doctor matching system that leverages artificial intelligence to streamline the process of connecting patients with the appropriate healthcare providers based on their medical needs. Built with a Python backend using Flask, a React frontend, and an IBM DB2 SQL database, MedicAI offers robust and intelligent functionalities. It includes an AI chatbot named Medo, which assists patients by making preliminary diagnoses and scheduling appointments with doctors. The slides present [here](https://github.com/Enzo2806/MedicAI/blob/main/Part3/Demo%20slides.pptx) show the UML Class Diagram of the application.

### Features
- **AI-Powered Matching:** Uses a Hugging Face fine-tuned transformer model on health diagnosis to analyze patient inquiries and match them with doctors based on specialty and availability.
- **Login and Authentication:** Secure login systems for both patients and doctors, ensuring data privacy and security.
- **Interactive Chatbot:** Patients can interact with Medo, the AI chatbot, to discuss symptoms and receive health advice before being referred to a doctor.
- **Dynamic Scheduling:** Patients can specify their availability to the agent, reschedule, or cancel appointments. Doctors can update their schedules to inform the AI of their available times.
- **Patient and Doctor Portals:**
  - **Patients** can view receipts post-consultation and maintain a list of favorite doctors for future appointments.
  - **Doctors** can view their upcoming appointments and modify their schedules accordingly.
- **Account Management:** Both patients and doctors can update their account information as needed.

### Technical Highlights
- **Backend:** Developed in Python with Flask.
- **Frontend:** Created with React for a responsive and intuitive user interface.
- **Database:** Uses IBM DB2, with advanced features like SQL stored procedures, data visualization commands, and index creation for optimized performance.

### Installation
To get started with MedicAI:
1. Clone the repository to your local machine.
2. Install the necessary dependencies:
 ```bash
 pip install -r requirements.txt
```
### Demo Screenshots
Visualize the capabilities and user interface of MedicAI through these screenshots:
![Report_Page_1](https://github.com/user-attachments/assets/27412242-8041-4aaf-afbf-de0c82e16b0f)
![Report_Page_2](https://github.com/user-attachments/assets/fc1fa463-8462-4682-8cad-19b3acb89753)
![Report_Page_3](https://github.com/user-attachments/assets/839068f6-392f-4448-b99b-c656d44a10ec)
![Report_Page_4](https://github.com/user-attachments/assets/4a3bd732-380e-4b90-9c90-87564c20a87d)
![Report_Page_5](https://github.com/user-attachments/assets/9bf386fb-7bd4-4218-ac6d-4122abe0382d)
![Report_Page_6](https://github.com/user-attachments/assets/7547c3c2-5a91-438b-80af-041dc5698fdd)


# **create-mycelial-shell**

A Command-Line Interface (CLI) for scaffolding new, fully-featured host applications for the Mycelial Framework.

## **What It Does**

This tool automates the creation of a new, independent host application ("Shell"). A Shell is the primary user-facing application that discovers, verifies, and runs "Spores."

This tool is for developers who want to create their own Mycelial ecosystem, complete with routing, real-time state, and the ability to connect to other hosts.

## **What's Generated**

The CLI creates a complete, ready-to-run Vue 3 \+ Vite project that includes all the core components of the Mycelial Framework:

* **A Pre-configured vite.config.js:** Includes the custom plugin to automatically register the new Shell with the Rendezvous server.  
* **The MycoAssert Library:** The full validation library is copied into src/mycoassert, making the Shell self-contained.  
* **The Mycelial-Naver System:** A boilerplate src/naver.js and a fully functional src/App.vue with all the logic for routing, spore discovery, and CTX management.  
* **Y.js Integration:** The App.vue is pre-configured with y-websocket and y-webrtc providers for real-time and persistent state.

## **Usage**

### **Creating a New Shell**

To create a new host application, run the following command in your terminal:

npm create mycelial-shell

The tool will launch an interactive wizard to configure your new project:

* **Project Name:** The name of the project folder (e.g., MycelialEntertainment).  
* **Host Name:** The unique name for discovery purposes (e.g., MycelialEntertainment-Host).  
* **Development Port:** The port its dev server will run on (e.g., 8080).

### **Local Development of the CLI**

To test the CLI tool itself locally:

1. **Navigate to the create-mycelial-shell directory.**  
2. **Link the package:**  
   npm link

3. **Run the command:**  
   create-mycelial-shell  

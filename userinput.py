# userinput.py
import tkinter as tk
from tkinter import messagebox

def submit():
    prompt_text = prompt_input.get("1.0", tk.END).strip()
    if not prompt_text:
        messagebox.showwarning("Missing Prompt", "Please enter a prompt.")
        return
    print(prompt_text)  # Output the prompt to the terminal
    root.destroy()  # Close the window after submitting

root = tk.Tk()
root.title("Prompt Input")
root.geometry("600x300")

tk.Label(root, text="📝 Enter your prompt below:").pack(pady=(10, 0))
prompt_input = tk.Text(root, height=10, wrap="word")
prompt_input.pack(padx=10, pady=(0, 10), fill="both", expand=True)

submit_btn = tk.Button(root, text="Submit", command=submit)
submit_btn.pack(pady=10)

root.mainloop()
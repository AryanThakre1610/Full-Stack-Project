# ShooterBackend

A C# Console Application for Video Game Data Management

## Overview
ShooterBackend is a modular backend system for managing and analyzing data for a video game catalog. It supports inventory, character, weapon, and power-up management, and provides analytics via a menu-driven console interface. The project demonstrates OOP principles (interfaces, inheritance, composition) and LINQ-based data analysis.

## Features
- **Game Entity Management:** CRUD operations for items, characters, weapons, and power-ups
- **Random Data Generation:** Populate inventories with sample data for testing
- **Data Analytics:** View statistics and summaries using LINQ queries
- **Menu System:** User-friendly console navigation
- **OOP Design:** Interfaces, abstract classes, and composition for extensibility

## Project Structure
```
ShooterBackend/
├── Models/         # Entity classes (GameItem, Character, Weapon, PowerUp, etc.)
├── Managers/       # Inventory and management logic
├── Services/       # Analytics and business logic
├── Utils/          # Random data generation
├── Program.cs      # Main entry point and menu system
├── README.md       # Project documentation
```


## Getting Started

### Prerequisites
- [.NET 10 SDK](https://dotnet.microsoft.com/download) must be installed on your system.

### Clone the Repository
Clone the project to your local machine:
```powershell
git clone <your-repo-url>
cd ShooterBackend
```

### Build the Project
```powershell
dotnet build
```

### Run the Application
```powershell
dotnet run
```

### Usage
Follow the console menu to:
- Manage items, characters, weapons, and power-ups
- Generate random data
- View analytics and statistics


## Extending the Project
- Add new entity types by creating new model classes
- Extend analytics by adding new LINQ queries in Services
- Enhance inventory logic in Managers

## License
This project is for educational purposes.

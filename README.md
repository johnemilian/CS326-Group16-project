# Project Info

This project is a website that would run on tablets inside the [Cape Abilities Farm](https://www.capeabilitiesfarm.org/who-we-are)'s greenhouses. It allows for employees and managers to see which seeds need to be planted and log when they have been planted.

### Setup

From inside the [Gantry](https://github.com/timdrichards/gantry) development environment, clone the repository:

```bash
git clone https://github.com/johnemilian/CS326-Group16-project
```

Navigate into the top level of the project directory.

Install Node.js dependencies:

```bash
npm install
```

Start the database:

```bash
dc-up mongo
```

Create a new database replacing `your-db-name`:

```bash
echo "MONGODB_URI=mongodb://dev:devpassword@mongo:27017/your-db-name?authSource=admin" >> .env
```

Running locally:

```bash
npm start
```

The server will open locally on <http://localhost:3000/>.

To stop the server run `ctrl + C` (^C) in the terminal.

# System Diagram

```plantuml
@startuml
!theme sketchy-outline
:Manager: as U1
(mongoose)
package "Browser" {

package "http://localhost/tasks" as tasksPage {
  (/views/tasks.ejs) as TV
  (/public/app.js) as client
}
(/public/style.css) as CSS
TV <-- CSS
}
package "Server" as ES {

package "Routers" {
(/routes/tasks.js) as TRou
}

package "Controllers" {
(/controllers/tasksController.js) as TC
}

package "Services" {
(/services/taskService.js) as TS
}

package "Data" {
(/repositories/taskRepository.js) as TRep
}
}
package "MongoDB" as DB {

}
(Express)

}
U1 -- tasksPage
Express -down- ES
mongoose -up-> TRep
TRou -down- TC
TS -down- TC
TS -down- TRep
tasksPage -right- TRou : GET/POST/PUT/DELETE
Data -down- DB
@enduml
```

# Team

### Team Members

| Name         | GitHub Username                               |
| ------------ | --------------------------------------------- |
| Sam Wolke    | [Ilyiux](https://github.com/Ilyiux)           |
| John Emilian | [johnemilian](https://github.com/johnemilian) |
| Ryan Trinh   | [NguyenAnh28](https://github.com/NguyenAnh28) |

### Working Agreement

- How communication will work: Group members are fine with communicating virtually, in person, or through text messages. Decisions on how to communicate will be made based on the importance of the task.
- Approving a pull request: A pull request from a member can be approved and merged by 1 other member of the group.
- Resolving disagreements: Group members agreed to take votes where the majority vote wins. If all 3 have different opinions, a debate/brainstorming session will be held to resolve the matter.

### Project Domain

The [Cape Abilities Farm](https://www.capeabilitiesfarm.org/who-we-are) creates employment opportunities for people with disabilities. The Farm wants to employ tablets in each of their six greenhouses that can serve as communication portals for task updates, alerts, and/or employee training. Specifically, group employment participants plant lettuce seeds on a weekly basis. An app where any individual member of the group could select which varieties of lettuce were planted would be helpful to both the lead grower and the employment group, giving more agency to participants, especially those to whom communication can be a barrier.

```

```

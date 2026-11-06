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

# Features

### Task List

The list runs at `GET /tasks`, and acts as a to-do list for various tasks on the farm.

Each task has the following information:

- Title - `text`
- Description - `text`
- Station - `text`
- Assigner - `text`
- Assignee - `text`
- Prerequisites - `text`
- Priority Level - `boolean`
- Deadline - `date`

Additionally, on the backend each task has an ID field.

New tasks are **created** at `POST /tasks`. A request to this endpoint is made after a user clicks the 'Add Task' button. It sends a json structured request of the following form, and the created task is immediately visible on their task list.

```json
{
  "title": "text",
  "description": "text",
  "station": "text",
  "assigner": "text",
  "assignee": "text",
  "prerequisites": "text",
  "deadline": "date"
}
```

_Note: Priority is not sent via JSON, it starts as false and is toggled in the database based on requests to the priority endpoint._

Existing tasks are **updated** at `PUT /tasks/:id`. A request to this endpoint is made after a user clicks the 'Save' button on the edit form in a specific task. It sends a JSON structured request to the endpoint matching the ID of the entry of the same form as the POST request, and the created task is immediately updated on their task list.

Existing tasks are **deleted** at `DELETE /tasks/:id`. A request to this endpoint is made after a user clicks the 'Delete' button on a specific task. It sends a request to the endpoint matching the ID of the deleted entry., and the deleted task is immediately removed on their task list.

Existing tasks have their priority toggled at `PATCH /tasks/:id/priority`. A request to this endpoint is made after a user clicks the 'Priority' button on a specific task. It sends a request to the endpoint matching the ID of the toggled entry, and the task is immediately toggled on their task list.

# Design Decisions

### MongoDB vs JSON File

We decided to use MongoDB for our database instead of a JSON file. This was primarily for the benefit that it eliminates the possibility of race conditions occurring in a deployed application when multiple requests arrive simultaneously. The alternative option was a JSON file, similar to the one used early in the example project. This would have worked equivalently during the development stage, since only one request would have arrived at one time, but is much less practical in a real implementation. Despite this being easier and more intuitive to work with since the data is more exposed, we decided against it for the benefit of future proofing. Having all of our data in a database that remains the same through the duration of development instead of deciding to switch later requires much less work.

\- Sam Wolke

### Layered vs flat design

We decided to follow the layered architecture as presented in Unit 11 last week. One of the notable benefits to this is consistency with separation of functionality. Each layer of functionality is more likely to follow a pattern if it's in a file aligned with its scope, and not distributed over a file in multiple spots, making the code for that "layer" harder to find and possibly different. This leads to another benefit of efficiency. With layered architecture, we will be less likely to repeat a pattern of code multiple times, which is likely to happen as the features add up. Though we probably would not have considered the alternative, what we did give up was simplicity at the current feature set. For example, to add a new feature requires modifying 3-5 layers/files, which at the current scale might seem unnecessary.

\- John Emilian

### Making extra task fields optional

We decided to make only the task title required in tasksService.js, while keeping the station, assigner, assignee, deadline, and prerequisites fields optional using required: false in tasksRepository.js. One of the main benefits of this is that it allows users to create a task immediately with just a title when other details aren't known yet. The alternative option was making every new field mandatory. While that would ensure all tasks have every detail filled out, it would trigger a 400 error if a task didn't have a deadline or prerequisites yet, forcing users to submit fake data just to get past validation. Though we give up having complete records for every single task right away, we decided it was better to avoid blocking users when certain details are missing.

\- Ryan Trinh

### Mocking the repository for tests instead of using real data

We decided that it would be best for our test suite to mock the repository layer of the application. The alternative was testing using actual database data, which would have the benefit of guaranteeing that it would function as desired when deployed. When mocking the repository layer, if done incorrectly, we run the risk of our tests being inaccurate. However, this would not be worth its downsides, since it would have required that we ensure that stray testing data does not make its way into the database and database entries that we needed did not run into the chance of being harmed. Additionally, not using the actual database results in the test suite running significantly faster since a database connection does not need to be established.

\- Sam Wolke

# System Diagram

![Group 16: Farm Task Tracker: system diagram](private/diagram.png)

# Sprint 3 Changes

### MongoDB

Our database was updated to MongoDB in Sprint 2. The repository layer (`/repositories/tasksRepository.js`) fully interfaces with the database. All five task routes eventually interact with one of the database methods:

- `GET /tasks` - pulls a list of all tasks (`getAll()`)
- `POST /tasks` - creates a new task (`create(data)`)
- `PUT /tasks/:id` - updates an existing task (`updateById(id, data)`)
- `DELETE /tasks/:id` - removes an existing task (`removeById(id)`)
- `PATCH /tasks/:id/priority` - toggles priority on an existing task (`updateById(id, data)`)

### Tests

Currently, the service layer has a test suite, contained in the file `/__tests__/tasksService.test.js`. These tests can be run with:

```bash
npm run test
```

### HTMX

The interaction that was converted to HTMX was the task submission form, which reaches the `POST /tasks` endpoint. This change is not noticeable to a user, but can be seen in `views/tasks.ejs` and `views/partials/task.ejs`.

### Visuals

The app received a visual overhaul using tailwind. This primarily altered the appearance of the Farm Tasks page.

**Before:**

![Image Showing Before](private/sprint_3_before.png)

**After:**

![Image Showing After](private/sprint_3_after.png)

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

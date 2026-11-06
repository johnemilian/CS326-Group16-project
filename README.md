# Project Info

This project is a website that would run on tablets inside the [Cape Abilities Farm](https://www.capeabilitiesfarm.org/who-we-are)'s greenhouses. It allows for employees and managers to see which seeds need to be planted and log when they have been planted.

### Setup

We are currently running server inside a custom environment container. To set up:

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/). Docker is the engine that runs the dev environment. The Desktop app gives you a graphical dashboard too.

   _Windows users: during installation, choose "Use WSL 2" if asked. After installing, open Docker Desktop once and let it finish starting up before moving on._

1. Install [Visual Studio Code](https://code.visualstudio.com/). The code editor.
1. Install [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers). This VS Code extension makes the "open in container" magic work. Click the link, then click Install, and VS Code will open and install it automatically.

   Now make sure Docker Desktop is running (look for the Docker whale icon in your taskbar or menu bar) before continuing.

1. Download the custom environment: Go to the [Gantry Dev Container Releases](https://github.com/timdrichards/gantry/releases) Under "Assets," download the latest release by selecting the file named `gantry-<version>.zip`. Do not download the "Source code" archives, that is not the release build. Save the file somewhere you can find it, such as your Desktop.
1. Extract the environment folder, `gantry-<version>.zip`, to your chosen folder location (do not leave it in your Downloads folder).

   On macOS: double-click `gantry-<version>.zip` to extract it. A folder named `gantry-<version>` will appear alongside the archive.

   On Windows: right-click `gantry-<version>.zip` and choose "Extract All." Select your destination folder and click Extract. A folder named `gantry-<version>` will appear in the destination folder.

   On Linux: open a terminal and run unzip `gantry-<version>.zip`. A folder named `gantry-<version>` will appear in the destination folder. You may also use a zip extracting application provided by the particular Linux distribution you are using (e.g., Ubuntu, Fedora, Arch)

1. Open the Development Environment in VS Code:
   1. Open VS Code. Go to **File → Open Folder** and select the development environment folder.

      VS Code will show a notification in the bottom-right corner (this may take a moment).

   1. Click **"Reopen in Container"**. If you missed the notification, open the Command Palette (`Ctrl+Shift+P` on Windows/Linux, `Cmd+Shift+P` on Mac), type **"Reopen in Container"**, and press Enter.
   1. Wait for the build to finish. The first time takes 3–5 minutes while it downloads everything. You will see a progress bar in the bottom-right corner. Subsequent openings are almost instant. It is helpful to be on a fast WiFi connection for this part.

   When the build finishes, VS Code reloads and you are now inside the development environment.

1. The terminal is how you run code and commands. Inside VS Code:

   Go to Terminal → New Terminal in the menu bar, or press ``Ctrl + ` `` (backtick).
   The Gantry banner confirms everything is working. The `$` at the end of the last line is the prompt, it is waiting for you to type a command.

   New to the terminal? The terminal works by typing a command and pressing Enter. Commands are case-sensitive. If something goes wrong, you can usually press `Ctrl+C` to stop whatever is running.

From inside the [Gantry](https://github.com/timdrichards/gantry) development environment, clone the repository:

```bash
git clone https://github.com/johnemilian/CS326-Group16-project
```

Navigate into the top level of the project directory.

Install Node.js production dependencies:

```bash
npm install --omit=dev
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

### Development

Install dev dependencies:

```bash
npm install
```

#### Tailwind CSS

[Tailwind](https://tailwindcss.com/) and [TailwindCSS CLI](https://tailwindcss.com/docs/installation/tailwind-cli) are used in this project.

To update the style sheet (`/public/style.css`) after any changes are made, run:

```bash
 npm run build:css
```

For an introduction, start with some of the pages from the Core Concepts section of the docs, such as:

- https://tailwindcss.com/docs/styling-with-utility-classes
- https://tailwindcss.com/docs/functions-and-directives
- https://tailwindcss.com/docs/detecting-classes-in-source-files
- https://tailwindcss.com/docs/adding-custom-styles

#### Jest Unit Testing

[Jest](https://jestjs.io/) is used for unit testing. See the [docs](https://jestjs.io/docs/getting-started#running-from-command-line) for an introduction.

Right now all tests check the service layer. They can be found in the `/__tests__` folder.

To run the full suite:

```bash
npm test
```

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

New tasks are **created** at `POST /tasks`. When a user clicks the 'Add Task' button, HTMX sends the form fields to this endpoint, and the server answers with the new task's HTML, which is added to the bottom of the task list without reloading the page. The endpoint also still accepts a JSON request of the following form, and answers with the created task as JSON.

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

### Tailwind CSS vs no framework

We decided to use Tailwind for the project, instead of plain CSS. Not just because it was a requirement for this sprint, but also because it will genuinely be useful. Tailwind's utility-first design makes it a good fit for small or nascent project. Not using a CSS Framework is a legitimate option. We are forgoing the this simplicity in favor of the scalability of the Tailwind framework. What it costs: a little bit of a learning curve, repetitive build steps, extra dev dependencies, and potentially more difficult troubleshooting.

\- John Emilian

### Converting Add task to HTMX instead of Delete

We decided to convert the Add task feature to HTMX instead of Delete. Before this, new tasks were built by JavaScript in the browser, which didn't have the Tailwind classes, so they showed up unstyled until you reloaded the page. With HTMX, the server sends back the task card from the same template as the rest of the list, so new tasks always look right. The alternative was converting Delete, which would also have been a simple change since the server just removes the task and htmx removes it from the page. But the unstyled task bug would still be there, and fixing it would mean copying all the Tailwind classes into the JavaScript, so the same card would be written in two places and have to be kept in sync. Though we give up converting Delete for now, we decided it was better to convert the feature that also fixes a visible bug.

\- Ryan Trinh

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

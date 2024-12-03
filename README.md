![LineBreak](logo.png)
Startup application for BYU CS 260.

## Quick Links

[Notes](notes.md)

## Overview

### Elevator pitch

LineBreak is a competitive programming website where two programmers concurrently modify the same code in a race to outmaneuver each other and achieve their seperate objectives.

### More details

Every challenge starts with some initial readonly code and a (mutually exclusive) objective for each programmer. Every turn, both programmers insert exactly one instruction into the program. If the final code - with both new instructions - meets one programmer's objectives, that programmer wins! If not, both programmers go again.

Programming is done in a simple 8-bit assembly environment, ChASM, that can be interpreted by both the server and the browser. Read-only portions of the code prevent freely modifying the "winning" code for an easy win.

## Mockup

![Mockup](mockup.jpg)

This mockup shows the main code editor screen, the meat of the application. It's a rough sketch, but it communicates the ideas.

## Technologies

-   HTML - Pages for signup, playing, and viewing challenge history.
-   CSS - Styling with good whitespace, color, etc (dark mode by default, obviously)
-   JavaScript - Interpreting/checking ChASM, handling syntax highlighting/etc (if I get to it), sending each player's updates back and forth.
-   React - SPA; reactively update views to match processor state and programmer input
-   Service - backend service with endpoints for:
    -   Beginning a new game
    -   Loading previous games
    -   Saving custom challenges
-   External service - QR code generator for sharing replays!
-   DB/Login - store users, custom challenges, games, and challenge history. To play a game against someone else (other than just practice) or create a custom challenge, users must authenticate (credentials stored securely)
-   WebSocket - as each user plays, their moves are sent to each other

## Startup HTML

For this deliverable I built out the structure of my application using HTML.

-   [x] **HTML pages** - three HTML pages that represent a landing page, a profile page, and a play page
-   [x] **Links** - the landing page has links to the profile page. The profile page and the play page link to each other and to the landing page
-   [x] **Text** - Promotional text and documentation is interspersed throughout
-   [x] **Images** - The LineBreak logo is displayed prominently on each page
-   [x] **DB/Login** - Input box and submit button for login. The statistics represent data pulled from the database
-   [x] **Third Party Service Calls** - A QR code is generated and displayed on the site. It's currently static, but it will be dynamic eventually.
-   [x] **WebSockets** - Communication between the two opponents requires websockets

## Startup CSS

For this deliverable I styled the application to an approximation of its final appearance.

-   [x] **Header, footer, and main content body**
-   [x] **Navigation elements** - I only have a navbar and it's styled nicely
-   [x] **Responsive to window resizing** - My app looks great on all window sizes (as long as they're reasonably wide)
-   [x] **Application text content** - Consistent fonts
-   [x] **Application images** - Images are appropriately sized and aligned

## Startup React

For this deliverable I implemented all the websocket-free behavior of my application!

To be clear, this means I:

-   Implemented an entire assembly language parser and interpreter (and its backing parser library)
-   Created a debugger interface, which required integrating with an opinionated non-React Javascript component
-   Wrote documentation for the assembly language and its interface

Rubric-wise, that looks like this:

-   [x] **Bundled and transpiled** - done!
-   [x] **Components** Login, profile, debugger, and documentation!
    -   [x] **login** - When you press enter or the login button it takes you to the profile page.
    -   [x] **database** - On the profile page, you can see stuff that'd be loaded from the database!
    -   [ ] **WebSocket** - I didn't mock websockets for this deliverable because I want the result to be usable.
    -   [x] **application logic** - hoo boy, there sure was a lot of logic in this application
-   [x] **Router** - routing!
-   [x] **Hooks** - uses a bunch of hooks, and also makes a custom hook! ([useEditorProp](https://github.com/21aslade/startup/blob/main/src/components/Editor.tsx#L149), for synchronizing with CodeMirror)

I worked really, really hard on this deliverable (including the dependencies that only exist for it, there are _121_ commits involved). I know I didn't mock the websockets, but it's unclear how I should. I also didn't realize from reading the rubric that mocking WebSocket would be required. Hopefully it's clear that I'm fully capable of mocking the WebSocket behavior. I'd appreciate it if I can still get full credit.

## Startup Service

For this deliverable I added backend endpoints for creating profiles and following other users.

-   [x] **Node.js/Express HTTP service** - done!
-   [x] **Static middleware for frontend** - done!
-   [x] **Calls to third-party endpoints** - the QR code on the profile page permalinks to the profile
-   [x] **Backend service endpoints** - login, following. I didn't realize that we didn't need any login stuff until the next deliverable. All other functionality is tied to websockets
-   [x] **Frontend calls service endpoints** - done!

## Startup Login

For this deliverable I hooked the login system up to the database and switched to using cookies

-   [x] **MongoDB Atlas Database created** - done!
-   [x] **Stores data in MongoDB** - done!
-   [x] **User registration** - creates a new account in the database
-   [x] **Existing user** - existing users can follow other users
-   [x] **Use MongDB to store credentials** - stores user, hashes passwords
-   [x] **Restricts functionality** - backend and frontend both require login to follow friend

(All this stuff was done today, cause there wasn't too much to do!)

## Dependencies

I use a number of dependencies in this project; I wrote some of them, but others are external:

-   [`chasm`](https://github.com/21aslade/chasm), an assembly parser and interpreter. I made it from scratch for this project!
-   [`wombo`](https://github.com/21aslade/wombo), the parser library backing `chasm`. Also made by me!
-   [`react-codemirror`](https://uiwjs.github.io/react-codemirror/), the editor I use. This was not made by me, but I got permission from the TA to use it. I also made some extensions for it:
    -   While the debugger is running, the currently executing line is highlighted
    -   Breakpoints can be added by clicking the line numbers
-   [`styled-components`](https://styled-components.com/), a simple style library. I use it just for convenience

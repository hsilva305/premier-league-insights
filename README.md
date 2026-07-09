# Web Development Project 6 - Premier League Match Insights

Submitted by: **Harold Alexander Silva**

This web app: **Serves as an interactive soccer analytics dashboard that pulls real-time fixture logs directly from the 2024-25 Premier League season via a public API. In this second iteration of the dashboard, I integrated a client-side routing system using React Router to separate concerns between global tracking views and isolated item breakdowns. The app features dual data visualizations tracking seasonal performance metrics, an overarching persistent navigation sidebar, mobile-responsive layouts, and dynamic URL routing parameters to render dedicated deep-linked fixture analytical sub-pages.**

Time spent: **6** hours spent in total

## Required Features

The following **required** functionality is completed:

- [x] **Clicking on an item in the list view displays more details about it**
  - Clicking on an item in the dashboard list navigates to a detail view for that item
  - Detail view includes extra information about the item not included in the dashboard view (Home/Away venue designations, aggregate goal outputs, and verified data ingestion endpoints)
  - The same sidebar is displayed in detail view as in dashboard view
  - *To ensure an accurate grade, your sidebar **must** be viewable when showing the details view in your recording.*
- [x] **Each detail view of an item has a direct, unique URL link to that item’s detail view page**
  -  *To ensure an accurate grade, the URL/address bar of your web browser **must** be viewable in your recording.*
- [x] **The app includes at least two unique charts developed using the fetched data that tell an interesting story**
  - At least two charts should be incorporated into the dashboard view of the site
  - Each chart should describe a different aspect of the dataset (Chart 1 tracks total goals per matchday round; Chart 2 displays match result ratios to show home-field advantages)

The following **optional** features are implemented:

- [x] The site’s customized dashboard contains more content that explains what is interesting about the data 
  - e.g., an additional description, graph annotation, suggestion for which filters to use, or an additional page that explains more about the data (Created a dedicated "About Insights" view component with data-slicing tips and analytical suggestions)
- [x] The site allows users to toggle between different data visualizations
  - User should be able to use some mechanism to toggle between displaying and hiding visualizations (Implemented a state-driven "Hide/Show Data Charts" interactive toggle button right above the charts)

The following **additional** features are implemented:

* [x] **Slider Crossover Guardrails:** I maintained inline structural check logic on the core React state filters to ensure that the minimum goal parameter slider can never physically step past the maximum goal limit value, preventing rendering errors.
* [x] **Fluid Mobile Responsiveness:** Integrated comprehensive `@media` query rulesets into the global CSS layout structure, transforming grid panels, input wrappers, and sidebars into seamless vertical stacks when viewed on mobile display screens.

## Video Walkthrough

Here's a walkthrough of implemented user stories:

<img src='./demo2.gif' title='Video Walkthrough' width='' alt='Video Walkthrough' />

GIF created with **N-Studio** ## Notes

During this expansion phase, I navigated two prominent structural hurdles:

* **Asynchronous Chart Hydration Conflicts:** Recharts requires a stable bounding layout width to compute its vector grid coordinates accurately. Initially, when my application ran its initial load state, the charts tried to render over an empty data array before the API fetch finished, freezing the container components with blank contents. I resolved this state conflict by piping a conditional guardrail (`goalsPerMatchday.length > 0 && ...`) directly into the layout renderer, holding chart mounting actions until the data array is fully loaded.
* **Vite Fast-Refresh Export Truncation:** While moving my code block over into a unified client-side routing hierarchy, a duplicate line snippet accidentally compiled at the very bottom of the source document, stripping Vite's capability to safely track the file's primary layout container. This triggered a blank white browser runtime screen citing a missing default export handler. Inspecting the browser console allowed me to isolate the syntax duplication, clean the trailing blocks, and re-establish hot module replacement syncing.

## License

    Copyright 2026 Harold Alexander Silva

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
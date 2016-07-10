# Project Feature Lifecycle Analysis

*4Rs for PivotalTracker*

## Notes

This is a pure Javascript client-side application.
It collects story data directly from the Pivotal Tracker API for analysis and charting in the browser.

This is the source repository, it is also where the application is hosted via GitHub Pages.

Run the application here: http://evendis.github.io/feature_lifecycle_analysis/


### PivotalTracker API Usage

## Fetching Project Information

Project information is retrieved with the
[project endpoint](https://www.pivotaltracker.com/help/api/rest/v5#Project).

Example Request (curl)
```
export TOKEN='your Pivotal Tracker API token'
export PROJECT_ID='your Pivotal Tracker ID'
curl -X GET -H "X-TrackerToken: $TOKEN" "https://www.pivotaltracker.com/services/v5/projects/${PROJECT_ID}"
```

Sample Response:
```
{
  "id":123456,
  "kind":"project",
  "name":"Sample Project",
  "version":63000,
  "iteration_length":4,
  "week_start_day":"Monday",
  "point_scale":"0,1,2,3,5,8",
  "point_scale_is_custom":false,
  "bugs_and_chores_are_estimatable":false,
  "automatic_planning":true,
  "enable_tasks":true,
  "time_zone":{"kind":"time_zone","olson_name":"Asia/Singapore","offset":"+08:00"},
  "velocity_averaged_over":4,
  "number_of_done_iterations_to_show":12,
  "has_google_domain":true,
  "description":"Babylon and the FV Portal",
  "enable_incoming_emails":true,
  "initial_velocity":50,
  "public":false,
  "atom_enabled":false,
  "project_type":"private",
  "start_date":"2010-12-13",
  "start_time":"2010-12-05T16:00:00Z",
  "created_at":"2010-11-04T05:38:56Z",
  "updated_at":"2016-04-07T01:44:41Z",
  "account_id":999999,
  "current_iteration_number":73,
  "enable_following":true
}
```


## Fetching Project Labels

Labels are retrieved with the
[labels endpoint](https://www.pivotaltracker.com/help/api/rest/v5#Labels).

Example Request (curl)
```
export TOKEN='your Pivotal Tracker API token'
export PROJECT_ID='your Pivotal Tracker ID'
curl -X GET -H "X-TrackerToken: $TOKEN" "https://www.pivotaltracker.com/services/v5/projects/${PROJECT_ID}/labels?date_format=millis"
```

Sample Response:
```
[
  {"kind":"label","id":1111110,"project_id":123456,"name":"4rs - refine","created_at":1381480325000,"updated_at":1381480325000},
  {"kind":"label","id":1111111,"project_id":123456,"name":"4rs - revise","created_at":1381480431000,"updated_at":1381480431000},
  {"kind":"label","id":1111112,"project_id":123456,"name":"4rs - retire","created_at":1382510349000,"updated_at":1382510349000},
  {"kind":"label","id":1111113,"project_id":123456,"name":"4rs - reveal","created_at":1381480356000,"updated_at":1381480356000},
  ...
]
```


### Fetching Stories

Stories are retrieved with the
[stories endpoint](https://www.pivotaltracker.com/help/api/rest/v5#Stories).


Example Request (curl)
```
export TOKEN='your Pivotal Tracker API token'
export PROJECT_ID='your Pivotal Tracker ID'
curl -X GET -H "X-TrackerToken: $TOKEN" "https://www.pivotaltracker.com/services/v5/projects/${PROJECT_ID}/stories?date_format=millis&filter=story_type:feature,bug%20state:accepted,rejected,delivered&limit=1"
```

Sample Response:
```
[
  {
    "kind":"story",
    "id":112345555,
    "created_at":1460617898000,
    "updated_at":1461146524000,
    "estimate":1,
    "story_type":"feature",
    "name":"As an API user, I can query sites with pagination",
    "current_state":"delivered",
    "requested_by_id":1666666,
    "url":"https://www.pivotaltracker.com/story/show/112345555",
    "project_id":123456,
    "owner_ids":[1666666,1666667],
    "labels":[
      {"kind":"label","id":6757190,"project_id":136709,"name":"4rs - revise","created_at":1381480325000,"updated_at":1381480325000}
    ],
    "owned_by_id":1666666
  },
  ...
]
```


### Building the App

Grunt is used to compile the less (CSS) and coffescript (Javascript) sources for the application
into the [app](./app) folder.

Grunt watch is setup to compile on any file changes:

```
grunt watch
```

### Hosting

The application is hosted with GitHub Pages, which makes it available for use directly from the GitHub repository.

The CNAME file links a custom domain to the application.


## Contributions

... are very welcome! CReate issues, fork and send pull-requests as you would any other open source project hosted on GitHub.

## Credits and References
* [PivotalTracker](https://www.pivotaltracker.com)
* [PivotalTracker API](https://www.pivotaltracker.com/help/api#top)
* [Interactive Ribbon Charts with plotly.js](https://github.com/tardate/LittleCodingKata/tree/master/javascript/plotly_ribbon_charts)
* [Progress Bars with Bootstrap](https://github.com/tardate/LittleCodingKata/tree/master/javascript/progress_bars_bootstrap)
* [Scrum](http://en.wikipedia.org/wiki/Scrum_(software_development))

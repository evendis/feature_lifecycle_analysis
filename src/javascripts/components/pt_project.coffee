root = exports ? this

# PT project interface
class root.PtProject

  # Initialise the class with options
  constructor: (@options, @resetProgress) ->
    @project_id = @options.project_id
    @token = @options.token
    @data_sets = [
      {
        name: 'retire',
        matcher: RegExp(@options.re_retire, 'i'),
        labels: [],
        stats: {}
      },
      {
        name: 'revise',
        matcher: RegExp(@options.re_revise, 'i'),
        labels: [],
        stats: {}
      },
      {
        name: 'refine',
        matcher: RegExp(@options.re_refine, 'i'),
        labels: [],
        stats: {}
      },
      {
        name: 'reveal',
        matcher: RegExp(@options.re_reveal, 'i'),
        labels: [],
        stats: {}
      }
    ]
    @stories = []

    true

  callApi: (url, params, callback)->
    token = @token
    $.ajax({
      url: url,
      data: params,
      beforeSend: (xhr)->
        xhr.setRequestHeader('X-TrackerToken', token)
    }).success(callback).fail (jqXHR, textStatus, errorThrown)->
      alert jqXHR.responseText

  load: (callback)->
    instance = @
    instance.resetProgress('Loading labels..')
    instance.loadLabels ->
      instance.resetProgress('Loading stories..', 5)
      instance.loadStories ->
        if $.isFunction(callback)
          callback()

  loadLabels: (callback)->
    instance = @
    url = instance.getUrl('labels')
    params = {
       date_format: 'millis'
    }
    @callApi(url, params, (data)->
      instance.analyseAndAssignLabels(data)
      if $.isFunction(callback)
        callback()
    )

  loadStories: (callback, offset)->
    instance = @
    url = instance.getUrl('stories')
    params = {
       date_format: 'millis',
       filter: 'story_type:feature,bug state:accepted,rejected,delivered',
       limit: 500,
       offset: offset || 0,
       envelope: true
    }
    @callApi(url, params, (envelope)->
      instance.accumulateStats(envelope.data)
      if envelope.pagination.returned < envelope.pagination.limit
        if $.isFunction(callback)
          callback()
      else
        instance.loadStories(callback, envelope.pagination.offset + envelope.pagination.returned)
    )

  analyseAndAssignLabels: (labels)->
    for label in labels
      for data_set in @data_sets
        if data_set.matcher.test(label.name)
          data_set.labels.push(label.name)

  weekDateSerial: (value)->
    given = new Date(value)
    week = new Date(given.getFullYear(), given.getMonth(), given.getDate() - given.getDay())
    week.valueOf()

  accumulateStats: (stories)->
    @stories = @stories.concat(stories)
    for story in stories
      label_names = story.labels.map (l)-> l.name
      for data_set in @data_sets
        related = false
        for label_name in label_names
          if data_set.labels.includes(label_name)
            related = true
        if related
          week = @weekDateSerial(story[@options.plot_by])
          if data_set.stats[week]
            current_count = data_set.stats[week]
          else
            current_count = 0
          data_set.stats[week] = current_count + 1

  getUrl: (resource)->
    'https://www.pivotaltracker.com/services/v5/projects/' + [@project_id, resource].join('/')

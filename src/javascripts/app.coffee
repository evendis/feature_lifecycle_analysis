root = exports ? this

# application controller - co-ordinates the marshalling of user input and rendering of the web page view
class root.AppController

  @project: null

  constructor: ->
    @snaffleUrlParams()
    @enableUiHooks()

  enableUiHooks: ->
    instance = @
    $('[data-action=load]').click (e)->
      e.preventDefault()
      instance.loadProject()
      return false
    true

  loadProject: ->
    instance = @
    instance.resolveProjectId()
    options = instance.getChartOptions()
    instance.resetProgress('Loading project #' + options.project_id + '..')
    instance.project = new root.PtProject(options, instance.resetProgress)
    instance.project.load ->
      instance.updatePermalink(options)
      instance.resetProgress('Generating the chart..')
      instance.drawChart()

  resetProgress: (title, duration)->
    # very rough progress indicator using a duration (seconds) guestimate
    duration = duration || 1
    $('#plot-panel').hide()
    $('#about-panel').hide()
    progress_container = $('#progress-panel')
    $('.panel-title', progress_container).html(title)
    progress_container.show()
    $('#myProgressbar').progressbar('animate', duration)

  resolveProjectId: ->
    project_id = $('#project_id').val().split('/').pop()
    $('#project_id').val(project_id)

  getChartOptions: ->
    options = {}
    $.each($('form#chartoptions').serializeArray(), (index, field)->
      options[field.name] = field.value
    )
    options

  updatePermalink: (options)->
    permalink = []
    for key, value of options
      unless key == 'token'
        permalink.push( key + '=' + encodeURIComponent(value))
    if permalink.length > 0
      search = '?' + permalink.join('&')
      $('#permalink').attr('href', search).show()
    else
      $('#permalink').hide()
    true

  drawChart: ->
    instance = @
    layout = {
      title: 'Story Analysis for Project #' + @project.project_id,
      showlegend: false,
      autosize: true,
      width: 800,
      height: 800,
      scene: {
        xaxis: {title: 'Lifecycle', type: 'category'},
        yaxis: {title: 'Date', type: 'date'},
        zaxis: {title: 'Stories'}
      }
    }
    setTimeout( ->
      instance.getChartData (data)->
        $('#progress-panel').hide()
        $('#plot-panel').show()
        Plotly.newPlot('plot-panel', data, layout)
    , 50)

  getChartData: (callback)->
    # this needs refactoring to avoid blocking UI updates
    colorscales = [
      [[0, 'rgb(128,62,62)'], [1, 'rgb(255,62,62)']],
      [[0, 'rgb(93,128,128)'], [1, 'rgb(93,255,255)']],
      [[0, 'rgb(62,128,62)'], [1, 'rgb(62,255,62)']],
      [[0, 'rgb(31,31,128)'], [1, 'rgb(31,31,255)']],
    ]
    traces = []
    for data_set, index in @project.data_sets
      trace = {
        z: [],
        x: [],
        y: [],
        name: '',
        colorscale: colorscales[index],
        type: 'surface',
        showscale: false
      }
      category = [data_set.name, index]
      keys = []
      for key, value of data_set.stats
        keys.push(Number.parseInt(key))
      if keys.length > 0
        keys.sort()
        for key in keys
          value = data_set.stats[key]
          trace.z.push([value, value])
          trace.y.push(key)
          trace.x.push(category)
        traces.push(trace)

    callback(traces)

  snaffleUrlParams: ->
    # if present, initialise fields based on url params
    $('#token').val(@param('token') || '')
    $('#plot_by').val(@param('plot_by') || 'created_at')
    $('#re_reveal').val(@param('re_reveal') || 'reveal|release')
    $('#re_refine').val(@param('re_refine') || 'refine')
    $('#re_revise').val(@param('re_revise') || 'revise|refurb')
    $('#re_retire').val(@param('re_retire') || 'retire|remove')
    project_id_param = @param('project_id')
    $('#project_id').val(project_id_param || '')
    if project_id_param
      $('.nav-tabs a[href="#analyze"]').tab('show')

  param: (name)->
    if values = (new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search)
      decodeURIComponent(values[1])

jQuery ->
  root.app = new root.AppController()

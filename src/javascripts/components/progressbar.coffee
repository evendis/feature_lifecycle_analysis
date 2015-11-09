root = exports ? this

class root.Progressbar

  constructor: (@element)->

  getBarElement: ->
    @element.find('[role="progressbar"]')

  update: (value)->
    bar = @getBarElement()
    bar.attr('aria-valuenow', value)
    bar.css('width', value + '%')
    bar.text(value + '%')
    bar

  setTransition: (value)->
    bar = @getBarElement()
    bar.css('transition', value)
    bar

  finish: ->
    @update(100)

  reset: ->
    @finish().finish()
    @setTransition('none')
    @update(0)

  animate: (duration)->
    instance = @
    instance.reset()
    setTimeout( ->
      duration_ms = Number.parseInt(duration) * 1000
      instance.setTransition('width 0.3s ease 0s').animate({
        width: "100%"
      }, {
        duration: duration_ms
        easing: 'linear'
        step: ( now, fx )->
          instance.update(Math.round(now))
        complete: ->
          # do something when the animation is complete
      })
    , 10)


  $.fn.progressbar = (option, args)->
    @.each ->
      element = $(@)
      data = element.data('fla.progressbar')

      if (!data)
        element.data('fla.progressbar', (data = new root.Progressbar(element)))
      if (typeof option == 'string')
        data[option](args)
      if (typeof option == 'number')
        data.update(option)

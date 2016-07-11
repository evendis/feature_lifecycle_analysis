(function() {
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.Progressbar = (function() {
    function Progressbar(element) {
      this.element = element;
    }

    Progressbar.prototype.getBarElement = function() {
      return this.element.find('[role="progressbar"]');
    };

    Progressbar.prototype.update = function(value) {
      var bar;
      bar = this.getBarElement();
      bar.attr('aria-valuenow', value);
      bar.css('width', value + '%');
      bar.text(value + '%');
      return bar;
    };

    Progressbar.prototype.setTransition = function(value) {
      var bar;
      bar = this.getBarElement();
      bar.css('transition', value);
      return bar;
    };

    Progressbar.prototype.finish = function() {
      return this.update(100);
    };

    Progressbar.prototype.reset = function() {
      this.finish().finish();
      this.setTransition('none');
      return this.update(0);
    };

    Progressbar.prototype.animate = function(duration) {
      var instance;
      instance = this;
      instance.reset();
      return setTimeout(function() {
        var duration_ms;
        duration_ms = Number.parseInt(duration) * 1000;
        return instance.setTransition('width 0.3s ease 0s').animate({
          width: "100%"
        }, {
          duration: duration_ms,
          easing: 'linear',
          step: function(now, fx) {
            return instance.update(Math.round(now));
          },
          complete: function() {}
        });
      }, 10);
    };

    $.fn.progressbar = function(option, args) {
      return this.each(function() {
        var data, element;
        element = $(this);
        data = element.data('fla.progressbar');
        if (!data) {
          element.data('fla.progressbar', (data = new root.Progressbar(element)));
        }
        if (typeof option === 'string') {
          data[option](args);
        }
        if (typeof option === 'number') {
          return data.update(option);
        }
      });
    };

    return Progressbar;

  })();

}).call(this);

(function() {
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.PtProject = (function() {
    function PtProject(options, resetProgress) {
      this.options = options;
      this.resetProgress = resetProgress;
      this.project_id = this.options.project_id;
      this.token = this.options.token;
      this.data_sets = [
        {
          name: 'retire',
          matcher: RegExp(this.options.re_retire, 'i'),
          labels: [],
          stats: {}
        }, {
          name: 'revise',
          matcher: RegExp(this.options.re_revise, 'i'),
          labels: [],
          stats: {}
        }, {
          name: 'refine',
          matcher: RegExp(this.options.re_refine, 'i'),
          labels: [],
          stats: {}
        }, {
          name: 'reveal',
          matcher: RegExp(this.options.re_reveal, 'i'),
          labels: [],
          stats: {}
        }
      ];
      this.stories = [];
      true;
    }

    PtProject.prototype.callApi = function(url, params, callback) {
      var token;
      token = this.token;
      return $.ajax({
        url: url,
        data: params,
        beforeSend: function(xhr) {
          return xhr.setRequestHeader('X-TrackerToken', token);
        }
      }).success(callback).fail(function(jqXHR, textStatus, errorThrown) {
        return alert(jqXHR.responseText);
      });
    };

    PtProject.prototype.load = function(callback) {
      var instance;
      instance = this;
      instance.resetProgress('Loading labels..');
      return instance.loadLabels(function() {
        instance.resetProgress('Loading stories..', 5);
        return instance.loadStories(function() {
          if ($.isFunction(callback)) {
            return callback();
          }
        });
      });
    };

    PtProject.prototype.loadLabels = function(callback) {
      var instance, params, url;
      instance = this;
      url = instance.getUrl('labels');
      params = {
        date_format: 'millis'
      };
      return this.callApi(url, params, function(data) {
        instance.analyseAndAssignLabels(data);
        if ($.isFunction(callback)) {
          return callback();
        }
      });
    };

    PtProject.prototype.loadStories = function(callback, offset) {
      var instance, params, url;
      instance = this;
      url = instance.getUrl('stories');
      params = {
        date_format: 'millis',
        filter: 'story_type:feature,bug state:accepted,rejected,delivered',
        limit: 500,
        offset: offset || 0,
        envelope: true
      };
      return this.callApi(url, params, function(envelope) {
        instance.accumulateStats(envelope.data);
        if (envelope.pagination.returned < envelope.pagination.limit) {
          if ($.isFunction(callback)) {
            return callback();
          }
        } else {
          return instance.loadStories(callback, envelope.pagination.offset + envelope.pagination.returned);
        }
      });
    };

    PtProject.prototype.analyseAndAssignLabels = function(labels) {
      var data_set, label, _i, _len, _results;
      _results = [];
      for (_i = 0, _len = labels.length; _i < _len; _i++) {
        label = labels[_i];
        _results.push((function() {
          var _j, _len1, _ref, _results1;
          _ref = this.data_sets;
          _results1 = [];
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            data_set = _ref[_j];
            if (data_set.matcher.test(label.name)) {
              _results1.push(data_set.labels.push(label.name));
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    PtProject.prototype.weekDateSerial = function(value) {
      var given, week;
      given = new Date(value);
      week = new Date(given.getFullYear(), given.getMonth(), given.getDate() - given.getDay());
      return week.valueOf();
    };

    PtProject.prototype.accumulateStats = function(stories) {
      var current_count, data_set, label_name, label_names, related, story, week, _i, _len, _results;
      this.stories = this.stories.concat(stories);
      _results = [];
      for (_i = 0, _len = stories.length; _i < _len; _i++) {
        story = stories[_i];
        label_names = story.labels.map(function(l) {
          return l.name;
        });
        _results.push((function() {
          var _j, _k, _len1, _len2, _ref, _results1;
          _ref = this.data_sets;
          _results1 = [];
          for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
            data_set = _ref[_j];
            related = false;
            for (_k = 0, _len2 = label_names.length; _k < _len2; _k++) {
              label_name = label_names[_k];
              if (data_set.labels.includes(label_name)) {
                related = true;
              }
            }
            if (related) {
              week = this.weekDateSerial(story[this.options.plot_by]);
              if (data_set.stats[week]) {
                current_count = data_set.stats[week];
              } else {
                current_count = 0;
              }
              _results1.push(data_set.stats[week] = current_count + 1);
            } else {
              _results1.push(void 0);
            }
          }
          return _results1;
        }).call(this));
      }
      return _results;
    };

    PtProject.prototype.getUrl = function(resource) {
      return 'https://www.pivotaltracker.com/services/v5/projects/' + [this.project_id, resource].join('/');
    };

    return PtProject;

  })();

}).call(this);

(function() {
  var root;

  root = typeof exports !== "undefined" && exports !== null ? exports : this;

  root.AppController = (function() {
    AppController.project = null;

    function AppController() {
      this.snaffleUrlParams();
      this.enableUiHooks();
    }

    AppController.prototype.enableUiHooks = function() {
      var instance;
      instance = this;
      $('[data-action=load]').click(function(e) {
        e.preventDefault();
        instance.loadProject();
        return false;
      });
      return true;
    };

    AppController.prototype.loadProject = function() {
      var instance, options;
      instance = this;
      instance.resolveProjectId();
      options = instance.getChartOptions();
      instance.resetProgress('Loading project #' + options.project_id + '..');
      instance.project = new root.PtProject(options, instance.resetProgress);
      return instance.project.load(function() {
        instance.updatePermalink(options);
        instance.resetProgress('Generating the chart..');
        return instance.drawChart();
      });
    };

    AppController.prototype.resetProgress = function(title, duration) {
      var progress_container;
      duration = duration || 1;
      $('#plot-panel').hide();
      $('#about-panel').hide();
      progress_container = $('#progress-panel');
      $('.panel-title', progress_container).html(title);
      progress_container.show();
      return $('#myProgressbar').progressbar('animate', duration);
    };

    AppController.prototype.resolveProjectId = function() {
      var project_id;
      project_id = $('#project_id').val().split('/').pop();
      return $('#project_id').val(project_id);
    };

    AppController.prototype.getChartOptions = function() {
      var options;
      options = {};
      $.each($('form#chartoptions').serializeArray(), function(index, field) {
        return options[field.name] = field.value;
      });
      return options;
    };

    AppController.prototype.updatePermalink = function(options) {
      var key, permalink, search, value;
      permalink = [];
      for (key in options) {
        value = options[key];
        if (key !== 'token') {
          permalink.push(key + '=' + encodeURIComponent(value));
        }
      }
      if (permalink.length > 0) {
        search = '?' + permalink.join('&');
        $('#permalink').attr('href', search).show();
      } else {
        $('#permalink').hide();
      }
      return true;
    };

    AppController.prototype.drawChart = function() {
      var instance, layout;
      instance = this;
      layout = {
        title: 'Story Analysis for Project #' + this.project.project_id,
        showlegend: false,
        autosize: true,
        width: 800,
        height: 800,
        scene: {
          xaxis: {
            title: 'Lifecycle',
            type: 'category'
          },
          yaxis: {
            title: 'Date',
            type: 'date'
          },
          zaxis: {
            title: 'Stories'
          }
        }
      };
      return setTimeout(function() {
        return instance.getChartData(function(data) {
          $('#progress-panel').hide();
          $('#plot-panel').show();
          return Plotly.newPlot('plot-panel', data, layout);
        });
      }, 50);
    };

    AppController.prototype.getChartData = function(callback) {
      var category, colorscales, data_set, index, key, keys, trace, traces, value, _i, _j, _len, _len1, _ref, _ref1;
      colorscales = [[[0, 'rgb(128,62,62)'], [1, 'rgb(255,62,62)']], [[0, 'rgb(93,128,128)'], [1, 'rgb(93,255,255)']], [[0, 'rgb(62,128,62)'], [1, 'rgb(62,255,62)']], [[0, 'rgb(31,31,128)'], [1, 'rgb(31,31,255)']]];
      traces = [];
      _ref = this.project.data_sets;
      for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
        data_set = _ref[index];
        trace = {
          z: [],
          x: [],
          y: [],
          name: '',
          colorscale: colorscales[index],
          type: 'surface',
          showscale: false
        };
        category = [data_set.name, index];
        keys = [];
        _ref1 = data_set.stats;
        for (key in _ref1) {
          value = _ref1[key];
          keys.push(Number.parseInt(key));
        }
        if (keys.length > 0) {
          keys.sort();
          for (_j = 0, _len1 = keys.length; _j < _len1; _j++) {
            key = keys[_j];
            value = data_set.stats[key];
            trace.z.push([value, value]);
            trace.y.push(key);
            trace.x.push(category);
          }
          traces.push(trace);
        }
      }
      return callback(traces);
    };

    AppController.prototype.snaffleUrlParams = function() {
      var project_id_param;
      $('#token').val(this.param('token') || '');
      $('#plot_by').val(this.param('plot_by') || 'created_at');
      $('#re_reveal').val(this.param('re_reveal') || 'reveal|release');
      $('#re_refine').val(this.param('re_refine') || 'refine');
      $('#re_revise').val(this.param('re_revise') || 'revise|refurb');
      $('#re_retire').val(this.param('re_retire') || 'retire|remove');
      project_id_param = this.param('project_id');
      $('#project_id').val(project_id_param || '');
      if (project_id_param) {
        return $('.nav-tabs a[href="#analyze"]').tab('show');
      }
    };

    AppController.prototype.param = function(name) {
      var values;
      if (values = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search)) {
        return decodeURIComponent(values[1]);
      }
    };

    return AppController;

  })();

  jQuery(function() {
    return root.app = new root.AppController();
  });

}).call(this);

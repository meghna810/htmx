describe('hx-disable attribute', function() {
  beforeEach(function() {
    this.server = makeServer()
    clearWorkArea()
  })
  afterEach(function() {
    this.server.restore()
    clearWorkArea()
  })

  it('does not process htmx attributes in content swapped into a disabled region', function() {
    this.server.respondWith('GET', '/test', '<button id="b2" hx-get="/evil">Injected</button>')
    this.server.respondWith('GET', '/evil', 'Pwned')

    make('<div><button id="b1" hx-get="/test" hx-target="#d1">Load</button><div id="d1" hx-disable></div></div>')
    byId('b1').click()
    this.server.respond()

    var injected = byId('b2')
    injected.innerHTML.should.equal('Injected')
    injected.click()
    this.server.respond()
    injected.innerHTML.should.equal('Injected')
    this.server.requests.length.should.equal(1)
  })

  it('ignores the attribute value and works with the data- prefix', function() {
    this.server.respondWith('GET', '/test', 'Clicked!')

    make('<div data-hx-disable="false"><button id="b1" hx-get="/test">Initial</button></div>')
    var btn = byId('b1')
    btn.click()
    this.server.respond()
    btn.innerHTML.should.equal('Initial')
    this.server.requests.length.should.equal(0)
  })

  it('respects a custom htmx.config.disableSelector', function() {
    this.server.respondWith('GET', '/test', 'Clicked!')
    var originalSelector = htmx.config.disableSelector
    try {
      htmx.config.disableSelector = '.no-htmx'
      make('<div class="no-htmx"><button id="b1" hx-get="/test">Initial</button></div>')
      var btn = byId('b1')
      btn.click()
      this.server.respond()
      btn.innerHTML.should.equal('Initial')
      this.server.requests.length.should.equal(0)
    } finally {
      htmx.config.disableSelector = originalSelector
    }
  })
})

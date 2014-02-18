require('freeloader').global();
require('../index').global();

var r = request.get('http://localhost:3000/hello')
               .header('Accept', 'application/json');

emit(r)
.pipe(perSecond(6))
.pipe(stopCount(20))
.pipe(progressDots())
.pipe(consoleSummary())
.pipe(send());
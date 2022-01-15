import buffer from '../buffer';

function eventsource({ url, bufferTime = 0 }, { feed, reset }) {
  let es;
  let buf;

  function initBuffer() {
    if (buf !== undefined) buf.stop();
    buf = buffer(feed, bufferTime);
  }

  return {
    start: () => {
      es = new EventSource(url);

      es.addEventListener('open', () => {
        console.debug('eventsource: opened');
        initBuffer();
      });

      es.addEventListener('message', event => {
        const e = JSON.parse(event.data);

        if (e.cols !== undefined || e.width !== undefined) {
          initBuffer();
          reset(e.cols ?? e.width, e.rows ?? e.height);
        } else {
          buf.pushEvent(e);
        }
      });

      es.addEventListener('done', () => {
        console.debug('eventsource: closed');
        es.close();
      });
    },

    stop: () => {
      if (buf !== undefined) buf.stop();
      if (es !== undefined) es.close();
    }
  }
}

export { eventsource };

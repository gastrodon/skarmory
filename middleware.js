// if javascript were a good programming language
// I would have a struct for a single limit item,
// which might look like { left: number, accepted: number }
const limits = {};
const minute = 60_000;

const stamp = () => new Date().getTime();
const minutes_ago = (when) => Math.trunc((stamp() - when) / minute);

// key is the ratelimit key ( ratelimit.get_key returns this )
// per_minute is the same as the ratelimit.per_minute argument
// returns whether or not we should accept this request,
// and has the sneaky side effect of updating the key's limit entry
// NOTE: If this code were actually used in any sort of real server
// it would most certainly cause a memory leak,
// so pretend that this is really just an abstraction
const may_request = (key, per_minute) => {
  const limit = limits[key] ?? { left: per_minute, accepted: stamp() };

  if (stamp() - limit.accepted >= minute) {
    limit.left += per_minute;
  }

  const do_request = limit.left > 0;

  if (do_request) {
    limit.accepted = stamp();
    limit.left--;
  }

  // NOTE: this is a GROSS race condition in any threaded language
  // but javascript is on a single thread ( also this is just a demo )
  limits[key] = limit;
  return do_request;
};

// get_key is a function that accepts some request,
// and returns a key to identify *what* we're ratelimiting
// for example it might return the requester's ip address
// per_minute is the number of requests this key may make
// returns an expressjs middleware that does ratelimiting
export const ratelimit = (get_key, per_minute) =>
  (request, response, next) => {
    const key = get_key(request);

    if (may_request(get_key(request), per_minute)) {
      next();
      return;
    }

    response.status(429).send("stop that >:(\n").end();
    return;
  };

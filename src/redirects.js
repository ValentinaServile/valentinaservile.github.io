/**
 * Redirects from the old WordPress URL structure.
 *
 * WordPress served posts at /YYYY/MM/DD/slug/ and its feed at /feed/. This site serves
 * /blog/slug/ and /rss.xml, so without these every inbound link, bookmark, search result
 * and feed subscription from the WordPress era would break at the DNS cutover.
 *
 * Astro emits a redirect page per entry for static output, so this needs no server.
 * Generated from the WordPress REST API's own permalinks — not reconstructed by hand.
 */
export const wordpressRedirects = {
	'/2021/01/16/hello-world': '/blog/hello-world/',
	'/2021/01/16/snippet-quick-node-js-http-server': '/blog/snippet-quick-node-js-http-server/',
	'/2021/01/16/one-line-bash-http-server': '/blog/one-line-bash-http-server/',
	'/2021/01/17/file-limits-and-how-the-too-many-open-files-error-can-pop-up-unexpectedly': '/blog/file-limits-and-how-the-too-many-open-files-error-can-pop-up-unexpectedly/',
	'/2021/01/25/ssh-for-developers-beyond-the-basics-series': '/blog/ssh-for-developers-beyond-the-basics-series/',
	'/2021/01/31/ssh-authentication-methods': '/blog/ssh-authentication-methods/',
	'/2021/01/31/ssh-known-hosts': '/blog/ssh-known-hosts/',
	'/2021/01/31/ssh-agent': '/blog/ssh-agent/',
	'/2021/01/31/ssh-config': '/blog/ssh-config/',
	'/2021/01/31/jumping-ssh-hosts': '/blog/jumping-ssh-hosts/',
	'/2021/01/31/ssh-tunnelling-and-port-forwarding': '/blog/ssh-tunnelling-and-port-forwarding/',
	'/2021/01/31/ssh-x11-forwarding': '/blog/ssh-x11-forwarding/',
	'/2021/01/31/ssh-multiplexing-and-master-mode': '/blog/ssh-multiplexing-and-master-mode/',
	'/2021/02/13/the-same-code-with-callbacks-vs-promises-vs-async-await': '/blog/the-same-code-with-callbacks-vs-promises-vs-async-await/',
	'/2021/02/14/solving-the-docker-in-docker-dilemma-in-your-ci-pipeline': '/blog/solving-the-docker-in-docker-dilemma-in-your-ci-pipeline/',
	'/2021/02/14/see-which-process-is-occupying-a-port': '/blog/see-which-process-is-occupying-a-port/',
	'/2021/02/21/visualising-distance-from-the-main-sequence-and-other-clean-architecture-metrics-in-java': '/blog/visualising-distance-from-the-main-sequence-and-other-clean-architecture-metrics-in-java/',
	'/2021/02/21/how-to-attach-a-remote-profiler-to-a-jvm-running-in-ec2-and-maybe-docker': '/blog/how-to-attach-a-remote-profiler-to-a-jvm-running-in-ec2-and-maybe-docker/',
	'/2021/05/15/an-isolated-developer-setup-with-docker': '/blog/an-isolated-developer-setup-with-docker/',
	'/2021/07/30/surviving-continuous-deployment-in-distributed-systems': '/blog/surviving-continuous-deployment-in-distributed-systems/',
	'/2022/08/12/qa-testing-in-production': '/blog/qa-testing-in-production/',
	'/2022/09/30/serializing-and-de-serializing-es6-class-instances-recursively': '/blog/serializing-and-de-serializing-es6-class-instances-recursively/',
	'/2022/10/17/cross-service-integration-tests-have-to-go': '/blog/cross-service-integration-tests-have-to-go/',
	'/2021/01/25/ssh-for-developers-beyond-the-basics-guide': '/blog/ssh-for-developers-beyond-the-basics-series/',
	'/feed': '/rss.xml',
	'/comments/feed': '/rss.xml',
	'/2022/10/12/an-agile-study-path-for-lead-developers': '/blog/an-agile-study-path-for-lead-developers/',
	'/2022/10/07/an-agile-study-path-for-senior-developers': '/blog/an-agile-study-path-for-senior-developers/',
	'/2022/10/07/an-agile-study-path-for-junior-to-mid-level-developers': '/blog/an-agile-study-path-for-junior-to-mid-level-developers/',
};

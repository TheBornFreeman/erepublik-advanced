## Release Information
eRepublik Advanced 4.2.7dev

### Google Chrome
After completing these steps you should have a working extension.

1.  Copy the `chrome` folder to somewhere on your computer.
2.  Put the `data` folder and the contents of the `src` and `vendor` folders into it.
3.  Open `chrome://extensions` and make sure `Developer mode` is on.
4.  Click `Load unpacked extension...` and give it the `chrome` folder you built.

Every time you make changes in the extension's folder you have to reload the extension. There is a reload link below the extension.

### Firefox
After completing these steps you should have a working Add-on.

1.  [Download](https://ftp.mozilla.org/pub/mozilla.org/labs/jetpack/jetpack-sdk-latest.zip) the Add-on SDK.
2.  Go through the Add-on SDK [installation](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/tutorials/installation.html) documentation.
3.  Get familiar with the `cfx` command-line [tool](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/tutorials/getting-started-with-cfx.html) and it's [options](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/dev-guide/cfx-tool.html).
4.  Make an Add-on skeleton with the `cfx init` command as you saw in the previous step.
5.  Copy `src/era.js` and the contents of `vendor` and `data` folders into your Add-on's `data` folder.
6.  Replace the empty `lib/main.js` in the Add-on's folder with `src/main.js`.
7.  Edit `package.json` according to `firefox/package.json` but leave the `id` untouched.
8.  Make a new Firefox profile just for Add-on development. This step is optional, but recommended.
9.  Use your `cfx` knowledge and run the Add-on with the `cfx run [-p <path-to-your-dev-profile>]` command.

In case you need help with the Add-on SDK here is the [documentation](https://addons.mozilla.org/en-US/developers/docs/sdk/latest/) for you.

### Notes
The source is a big mess right now, but it will get better with time. I have plans and solutions that I will share later on.

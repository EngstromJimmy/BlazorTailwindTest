---
title: Using Tailwind with Blazor
date: 2022-07-20T00:00:00.000+01:00
categories:
- Blazor
author: Jimmy Engström
tags:
- Blazor
# image: /PostImages/2020-03-21-UsingHighchartsWithBlazor/highcharts.PNG

---
#Using Tailwind with Blazor
This is a draft of a blog post about using Tailwind with Blazor. I will update this post as I go along.
This blog post will be published on my blog https://engstromjimmy.com/

## The problem?
Back in the day when I learned CSS, it was a big thing not to repeat yourself. you should have all the styles in one central place.
Then came isolated CSS, which simply meant we writing CSS for one single component and the styles will not affect anything else on the site.
Pretty much the opposite of what we did before.

Personally, I am a big fan of semantic CSS, meaning that I try to not use class names at all.
Instead, I use the HTML elements as selectors. 
For example:
```css
button {
    font-size: 2rem;
}
```
This will make sure ALL button elements on the site will have a font-size of 2rem.
The alternative is to add a class to the button to set the style.

It took me a while but I'm starting to see the benefits of having isolated CSS.
If the style is ONLY going to be used in one component, why not have it there?
In Blazor we can do that by adding a CSS file next to the component naming if the same way and adding .css
```ComponentName.razor.css```.

Bootstrap is bloated, it comes with "everything".
We can limit what it brings with it but it does take some effort.

## But what about Tailwind?
I am honestly not a fan of Tailwind, I am not even sure I want to try it.
But I have seen a lot of people using it and I wanted to see what it was all about.

Tailwind does not come with any pre-defined styles at all.
Instead, you have to add the styles you want to use.
Good: there is nothing predefined I have to take conscious choices for everything we need.
Bad: I have to take conscious choices for everything we need.
Bootstrap gets a lot of hate because "all sites look the same", but you can also see it as you get help to get started quickly.

Tailwind takes the classes that we use in our documents and creates a CSS that only contains the thing we need.
Hence removing the bloat compared to Bootstrap.

One of the problems with Tailwind is that it has micro classes, classes that only affect one of a few things.
That means that a bootstrap button would look like this:
``` html
<button type="button" class="btn btn-primary">Primary</button>
```
would look something like this in Tailwind:
``` html
<button type="button" class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-3 rounded">Primary</button>
```
Disclaimer: I converted Boostrap to Tailwind using an online tool, there are definitely better ways of converting from Bootstrap. But this gives us a feeling of what the problem is.
Our markup is going to be pretty bloated.
I saw that there is an extension for Visual Studio Code that hides the classes in the editor to avoid all the clutter.

This is also the preferred way of doing styling, we could group everything into a .button-class but that is not the preferred way in Tailwind.
The idea is to style components separately in Angular and React for example.
In Blazor we have components as well so it is probably a good match for Blazor as well.

To use Tailwind we need a utility, a utility that collects all the classes used and creates a CSS.
The simplest way to get this to work is to use NPM.
One of the really nice things about working with Blazor is that I don't need NPM.
There is also a CLI you can download from Tailwind (bypassing the need for NPM), but then how do we make sure everyone in the team is running the same version?

## The solution

But what if there was a way to combine the technologies?
Take the best from everything and avoid the "bad"?

In this blog post, I am going to try to solve three problems.
1. Making sure everyone on the team is running the same version of the CLI
2. Make sure Blazor isolated CSS works
3. Not adding all the styles to the class tag

### Downloading the CLI
Instead of having all the members of the team downloading and manage their Tailwind CLI we can use Visual Studio to download and install it for us automatically.
In our csproj file, we can simply add the version we want to use and let Visual studio manage the versioning.
Add the following to our csproj
```html
<PropertyGroup>
    <TailwindToolsVersion>3.1.8</TailwindToolsVersion>
</PropertyGroup>

<!-- <Settings and download> -->
<Target Name="AcquireTailwindTooling" DependsOnTargets="GetTailwindToolingInputs" Condition="!Exists('$([System.IO.Path]::Combine($(TailwindExeDir),$(TailwindToolsVersion))).txt')">
	<Message Importance="high" Text="Downloading Tailwind Cli" />
	<DownloadFile SourceUrl="https://github.com/tailwindlabs/tailwindcss/releases/download/v$(TailwindToolsVersion)/$(TailwindDownloadName)" DestinationFileName="$(TailwindExeName)" DestinationFolder="$(TailwindExeDir)" />
	<WriteLinesToFile File="$([System.IO.Path]::Combine($(TailwindExeDir),$(TailwindToolsVersion))).txt" Lines="Downloaded"/>
	<Exec Condition="!$([MSBuild]::IsOSPlatform('Windows'))" Command="chmod +x '$(TailwindExePath)'" />
</Target>

<Target Name="GetTailwindToolingInputs">
	<PropertyGroup>
		<TailwindDownloadName Condition="$([MSBuild]::IsOSPlatform('Windows'))">tailwindcss-windows-x64.exe</TailwindDownloadName>
		<TailwindDownloadName Condition="$([MSBuild]::IsOSPlatform('Linux'))">tailwindcss-linux-x64</TailwindDownloadName>
		<TailwindDownloadName Condition="$([MSBuild]::IsOSPlatform('OSX'))">tailwindcss-macos-x64</TailwindDownloadName>
		<TailwindExeDir>$([System.IO.Path]::Combine($(MSBuildThisFileDirectory), ".tailwind"))</TailwindExeDir>
		<TailwindExeName>tailwindcss$([System.IO.Path]::GetExtension($(TailwindDownloadName)))</TailwindExeName>
		<TailwindExePath>$([System.IO.Path]::Combine($(TailwindExeDir), $(TailwindExeName)))</TailwindExePath>
	</PropertyGroup>
</Target>
<!-- </Settings and download> -->

```
This code will make sure the selected version is installed, and when we update the version it will make sure to update it for all members of the team.

What about Isolated CSS?
That is what we will look at next.

### Making Isolated CSS work
When we make changes to isolated CSS, Visual Studio will take that CSS and produce a CSS file.
We can hook into that process, letting Visual Studio produce the file just as before, and then let Tailwind rewrite the file so that we get the CSS classes we need.

``` csharp
<!-- <Process Razor,Cshtml etc with Tailwind> -->
<Target Name="ProcessCssWithTailwindOnBuild" BeforeTargets="CoreBuild" DependsOnTargets="GetTailwindToolingInputs; AcquireTailwindTooling">
	<Message Importance="high" Text="Running Tailwind Cli" />
	<Exec WorkingDirectory="$(MSBuildThisFileDirectory)" Command="$(TailwindExePath) -i wwwroot/css/app.css -o wwwroot/css/app.out.css" />
</Target>
<!-- </Process Razor,Cshtml etc with Tailwind> -->

<!-- <Process scoped CSS with Tailwind> -->
<Target Name="ProcessScopedCssWithTailwindOnSave" AfterTargets="_GenerateScopedCssFiles" DependsOnTargets="GetTailwindToolingInputs; AcquireTailwindTooling">
	<MSBuild Projects="$(MSBuildProjectFile)" Properties="CurrentScopedCssFile=%(_ScopedCssOutputs.Identity)" Targets="ProcessScopedCssFileWithTailwind">
	</MSBuild>
</Target>


<Target Name="ProcessScopedCssFileWithTailwind" DependsOnTargets="GetTailwindToolingInputs">
	<Message Importance="high" Text="Processing with Tailwind: $(CurrentScopedCssFile)" />
	<Exec Command="$(TailwindExePath) -i $(CurrentScopedCssFile) -o $(CurrentScopedCssFile)" WorkingDirectory="$(MSBuildProjectDirectory)" EnvironmentVariables="TAILWIND_MODE=build" />
</Target>
<!-- </Process scoped CSS with Tailwind> -->
```

This code does two things.
1. Triggers Tailwind to generate files on Build
2. Triggers Tailwind to intercept and generate isolated CSS on save

In most cases, this should be all we need, but sometimes we want to change the CSS without having to build the project and that can still be done using the CLI from the command line.
I really like this approach because the tolling is in the workflow of Visual studio. I don't have to use the CLI if I don't want to.

Besides this, we need to set up our project for Tailwind.
Simply run the following command in the project folder:
```
.\.tailwind\tailwindcss init
```
This will give us a config file that we need to change a bit.
By default the ```tailwind.config.js``` looks like this:
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [],
  theme: {
    extend: {},
  },
  plugins: [],
}

The content attribute we need to specify what files it should process.
In our case we want it to process .razor, .html and .cshtml.
This should support both Blazor server as well as Blazor WebAssembly.

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './**/*.html',
        './**/*.cshtml',
        './**/*.razor',
    ],
  theme: {
    extend: {},
  },
  plugins: [],
}

```

### Semantic CSS?
Now when everything is set up we can put our Tailwind styles inside our components by using isolated CSS.
This means that the CSS we write is only affecting that particular component, which also means that we can write our semantic CSS right there.
We don't need to add any classes in the markup itself but instead have the CSS inside the isolated CSS file.

No NPM  
No manually downloading CLI  
No bloated markup  

I'll be honest I am still not a fan, but I think that since we can remove some of my pain points perhaps one day, I will start working with it =)
It feels a bit like I am going out of my way to remove the dependency on NPM, and if you don't mind NPM you should definitely continue to use it.
You can still use isolated CSS but use NPM commands instead of Tailwind CLI.

```Counter.razor``` with Tailwind:

```html
@page "/counter"

<PageTitle>Counter</PageTitle>

<h1 class="text-4xl font-bold mb-4">Counter</h1>

<p>Current count: @currentCount</p>

<button class="mt-4 bg-gradient-to-br from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 text-white p-2 rounded border border-green-600"
        @onclick="IncrementCount">Click me</button>
```
```Counter.razor``` with Tailwind, isolated CSS and semantic CSS :

``` html
@page "/counter"

<PageTitle>Counter</PageTitle>

<h1>Counter</h1>

<p>Current count: @currentCount</p>

<button @onclick="IncrementCount">Click me</button>
```
and the isolated CSS```Counter.razor.css```
``` css
h1 {
    @apply text-4xl font-bold mb-4;
}

button {
    @apply mt-4 bg-gradient-to-br from-green-600 to-green-500 hover:from-green-500 hover:to-green-600 text-white p-2 rounded border border-green-600
}
```

The base of this Tailwind implementation is borrowed from Chris Sainty.
You can find his repo [here](["https://github.com/chrissainty/ondotnet-tailwindcss"]).




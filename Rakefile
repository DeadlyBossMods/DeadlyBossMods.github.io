#!/usr/bin/env rake
abort('Please run this using `bundle exec rake`') unless ENV["BUNDLE_BIN_PATH"]

desc "Initial setup"
task :bootstrap do
	puts "Installing bundle..."
	puts `bundle install --without distribution`
end

desc "Builds the site locally"
task :build do
	puts "Building site..."
	sh "PRODUCTION=\"YES\" jekyll build --destination _gh-pages"
end

desc "Runs some tests"
task :test do
	puts "Running tests..."
	require "html-proofer"
	begin
		HTMLProofer.check_directory('./_gh-pages/', {
			:check_html				=> true,
			:check_external_hash	=> true,
			:check_image_http		=> true,
			:parallel => {
				:in_process => 3
			},
			:cache => {
				:timeframe => '1w'
			}
		}).run
	rescue => msg
		puts "#{msg}"
	end
end

desc "Runs a local server and watches for changes"
task :serve do
	jekyll = Process.spawn("PRODUCTION=\"NO\" bundle exec jekyll serve --watch --port 4000")
	trap("INT") {
		Process.kill(9, jekyll) rescue Errno::ESRCH
		exit 0
	}
	Process.wait(jekyll)
end

desc "Deploy the site to the gh_pages branch and push"
task :deploy do
	FileUtils.rm_rf "_gh-pages"
	puts "Cloning master branch..."
	puts `git clone https://github.com/DeadlyBossMods/DeadlyBossMods.github.io.git _gh-pages`
	Dir.chdir("_gh-pages") do
		puts "Pulling changes from server..."
		puts `git checkout master`
		puts `git reset --hard`
		puts `git clean -xdf`
		puts `git checkout master`
		puts `git pull origin master`
	end
	Rake::Task["build"].invoke
	Dir.chdir("_gh-pages") do
		puts "Pulling changes from server..."
		puts `git checkout master`
		puts `git pull origin master`
		puts "Creating a commit for the deploy..."
		puts `git ls-files --deleted -z | xargs -0 git rm;`
		puts `git add .`
		puts `git commit -m "Deploy"`
		puts "Pushing to GitHub..."
		puts `git push`
	end
end

namespace :deploy do
	desc "Run on Travis only; Deploys the site when built on the source branch"
	task :travis do
		# Travis CI checks.
		branch = ENV["TRAVIS_BRANCH"]
		abort "Must be run on Travis." unless branch
		abort "Skipping deploy for non-source branch #{branch}." if branch != "source"
		abort "Skipping deploy from pull request." if ENV["TRAVIS_PULL_REQUEST"] != "false"
		# Setup for deployment, so you can push to https without entering creds all the time.
		puts `git config --global user.email #{ENV["GIT_EMAIL"]}`
		puts `git config --global user.name #{ENV["GIT_NAME"]}`
		File.open("#{ENV["HOME"]}/.netrc", "w") { |file|
			file.write("machine github.com login #{ENV["GH_TOKEN"]}")
		}
		puts `chmod 600 ~/.netrc`
		# Now deploy
		Rake::Task["deploy"].invoke
	end
end

desc "Defaults to serve"
task :default => "serve"

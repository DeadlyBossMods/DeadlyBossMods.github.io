require "json"

fixes = [
	{
		word:	"deadlybossmods",
		reason:	"Please use DeadlyBossMods"
	},
	{
		word:	"deadly boss mods",
		reason:	"Please use DeadlyBossMods"
	},
	{
		word:	"wow",
		reason:	"Please use WoW"
	},
	{
		word:	"[]: ???",
		reason:	"You\"ve missed a link"
	},
	{
		word:	"[TODO]",
		reason:	"You have missed a TODO"
	}
]

(git.modified_files + git.added_files).uniq.select { |file| 
	file.end_with?(".md", ".markdown"))
}.each do |filename|
	file = File.read(filename)
	file.lines.each do |line|
		fixes.each do |fix|
			warn(fix[:reason], file: filename, line: lines.index) if line.include? fix[:word]
		end
	end
end

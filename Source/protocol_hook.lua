-- protocol_hook.lua
-- handlers.json: https://searchfox.org/mozilla-central/source/uriloader/exthandler/tests/unit/handlers.json

local utils = require 'mp.utils'
local msg = require 'mp.msg'
local cwd = 'D:/mpv'

local function parseqs(url)
    local query = url:match("%?(.+)")
    if not query then return nil end

    local args = {}
    for arg, param in query:gmatch("([^&]+)=([^&]+)") do
        args[arg] = param
    end

    return args
end

-- local function parseqs(url)
--     -- return 0-based index to use with --playlist-start

--     local query = url:match("%?.+")
--     if not query then return nil end

--     local args = {}
--     for arg, param in query:gmatch("(%a+)=([^&?]+)") do
--         if arg and param then
--             args[arg] = param
--         end
--     end
--     return args
-- end

local function dump(o)
   if type(o) == 'table' then
      local s = '{ '
      for k,v in pairs(o) do
         if type(k) ~= 'number' then k = '"'..k..'"' end
         s = s .. '['..k..'] = ' .. dump(v) .. ','
      end
      return s .. '} '
   else
      return tostring(o)
   end
end

local function split(text, delim)
    -- returns an array of fields based on text and delimiter (one character only)
    local result = {}
    local magic = "().%+-*?[]^$"

    if delim == nil then
        delim = "%s"
    elseif string.find(delim, magic, 1, true) then
        -- escape magic
        delim = "%"..delim
    end

    local pattern = "[^"..delim.."]+"
    for w in string.gmatch(text, pattern) do
        table.insert(result, w)
    end
    return result
end

local b='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/' -- You will need this for encoding/decoding
-- encoding
local function enc(data)
    return ((data:gsub('.', function(x) 
        local r,b='',x:byte()
        for i=8,1,-1 do r=r..(b%2^i-b%2^(i-1)>0 and '1' or '0') end
        return r;
    end)..'0000'):gsub('%d%d%d?%d?%d?%d?', function(x)
        if (#x < 6) then return '' end
        local c=0
        for i=1,6 do c=c+(x:sub(i,i)=='1' and 2^(6-i) or 0) end
        return b:sub(c+1,c+1)
    end)..({ '', '==', '=' })[#data%3+1])
end

-- decoding
local function dec(data)
    data = string.gsub(data, '[^'..b..'=]', '')
    return (data:gsub('.', function(x)
        if (x == '=') then return '' end
        local r,f='',(b:find(x)-1)
        for i=6,1,-1 do r=r..(f%2^i-f%2^(i-1)>0 and '1' or '0') end
        return r;
    end):gsub('%d%d%d?%d?%d?%d?%d?%d?', function(x)
        if (#x ~= 8) then return '' end
        local c=0
        for i=1,8 do c=c+(x:sub(i,i)=='1' and 2^(8-i) or 0) end
            return string.char(c)
    end))
end

local function atobUrl(url)
    url = string.gsub(url, '_', '/')
    url = string.gsub(url, '-', '+')
    url = dec(url)
    return url
end

local function exec(args)
    print("Running: " .. table.concat(args, " "))

    return mp.command_native({
        name = "subprocess",
        args = args,
        capture_stdout = true,
        capture_stderr = true,
    })
end



local function livestreamer(url, referer)
    print('streamlink')
    print(url)
    local url2 = '"'..url..'"'
    print(url2)
    local cmd = 'run '..cwd..'/streamlink/bin/streamlink.exe '..url2..' 720p,best,worst --config='..cwd..'/streamlink/streamlink.conf'
    print(cmd)
    mp.command(cmd)
    md.command('quit')
end

local function EA(url, referer, app)
    print('app')
    local url2 = '"'..url..'"'
    local cmd = 'run '..app..' '..url2
    mp.command(cmd)
    md.command('quit')
end

local function ytdl(url, referer)
    print('ytdl')
    print(url)
    local url2 = '"'..url..'"'
    print(url2)
    local cmd = 'run cmd /c cd /d '..cwd..' && start yt-dlp '..url2
    print(cmd)
    mp.command(cmd)
    md.command('quit')
end

mp.add_hook("on_load", 15, function()
    local referer = ''
    local url = mp.get_property("stream-open-filename", "")
    local qs = {}
    if (url:find("mpv://") ~= 1) then
        msg.info("not a mpv url: " .. url)
        return
    end
    local arr = split(url, '/')
    if arr[1] == 'mpv:' then
        url = atobUrl(arr[3])
        if (url:find("data:") == 1) then
            url = atobUrl(split(url, ',')[2])
            print(url)
        end
        if arr[4] then
            qs = parseqs(arr[4])
        end
        local function subadd()
            local subs = qs['subs']
            subs = atobUrl(subs)
            mp.commandv('sub-add', subs)
        end
        if qs['subs'] then
            mp.register_event("file-loaded", subadd)
        end
        if qs['referer'] then
            local referer = qs['referer']
            referer = atobUrl(referer)
        end
        if arr[2] == 'play' then
            for link in string.gmatch(url, "[^%s]+") do
                if referer ~= '' then
                    mp.commandv('set', 'http-header-fields', 'Referer: "'..referer..'"')
                end
                mp.commandv('loadfile', link, 'append')
            end
        elseif arr[2] == 'mg' then
            mp.set_property('osd-duration', '0')
            for link in string.gmatch(url, "[^%s]+") do
                link = 'gallery-dl://'..link
                mp.commandv('loadfile', link, 'append')
            end
        elseif arr[2] == 'stream' then
            livestreamer(url, referer)
        elseif arr[2] == 'ytdl' then
            ytdl(url, referer)
        elseif qs['app'] then
            local app = qs['app']
            app = atobUrl(app)
            EA(url, referer, app)
        end
    end
end)



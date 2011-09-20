require 'rubygems'
require 'sinatra'

class Server < Sinatra::Base
   set :public, File.dirname(__FILE__)

   post '/Example/upload' do
     puts params.inspect
   end

   run!
end

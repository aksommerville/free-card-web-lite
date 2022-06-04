all:
.SILENT:
.SECONDARY:
PRECMD=echo "  $(@F)" ; mkdir -p $(@D) ;

clean:;rm -rf mid out

# sudo npm install -g http-server
serve:;http-server src/www

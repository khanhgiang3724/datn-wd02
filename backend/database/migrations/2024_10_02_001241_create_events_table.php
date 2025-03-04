<?php

use App\Enums\EventStatus;
use App\Models\Category;
use App\Models\District;
use App\Models\Province;
use App\Models\Ward;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            $table->foreignIdFor(Category::class)->constrained()->onDelete('cascade');
            $table->enum('status', EventStatus::getValues())->default(EventStatus::PENDING);
            $table->string('province');
            $table->string('district');
            $table->string('ward');
            $table->json('speakers')->nullable();
            $table->string('name', 255);
            $table->text('description');
            $table->string('thumbnail', 255);
            $table->dateTime('start_time');
            $table->dateTime('end_time');
            $table->string('location', 255);
            $table->enum('event_type', ['online', 'offline']);
            $table->string('link_online', 255)->nullable();
            $table->bigInteger('max_attendees')->nullable();
            $table->bigInteger('registed_attendees')->nullable();
            $table->boolean('display_header')->default(false);
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
